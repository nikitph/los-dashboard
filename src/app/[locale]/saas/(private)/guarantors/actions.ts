"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/prisma";
import { GuarantorSchema as guarantorSchema } from "@/schemas/zodSchemas";

// Type for guarantor input data
export type GuarantorFormData = z.infer<typeof guarantorSchema>;

// Response type for actions
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * Create a new guarantor
 * @param formData The guarantor data
 */
export async function createGuarantor(formData: GuarantorFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = guarantorSchema.parse(formData);

    // Create guarantor in database
    const guarantor = await prisma.guarantor.create({
      data: {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Revalidate the guarantors list path
    revalidatePath("/saas/guarantors/list");

    return {
      success: true,
      message: "Guarantor created successfully",
      data: guarantor,
    };
  } catch (error) {
    console.error("Error creating guarantor:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to create guarantor",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all guarantors with optional filtering and sorting
 */
export async function getGuarantors(
  searchTerm = "",
  stateFilter = "all",
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  },
) {
  try {
    // Build filter conditions
    const filters: any = {
      deletedAt: null, // Only get non-deleted guarantors
    };

    // Add state filter if specified
    if (stateFilter !== "all") {
      filters.addressState = stateFilter;
    }

    // Get guarantors with filters
    const guarantors = await prisma.guarantor.findMany({
      where: filters,
      include: {
        loanApplication: {
          include: {
            applicant: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Apply search filter if provided
    let filteredGuarantors = guarantors;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredGuarantors = guarantors.filter((guarantor) => {
        return (
          guarantor.firstName.toLowerCase().includes(search) ||
          guarantor.lastName.toLowerCase().includes(search) ||
          guarantor.email.toLowerCase().includes(search) ||
          guarantor.addressState.toLowerCase().includes(search) ||
          guarantor.addressCity.toLowerCase().includes(search) ||
          guarantor.addressZipCode.includes(search) ||
          guarantor.addressLine1.toLowerCase().includes(search) ||
          (guarantor.addressLine2?.toLowerCase() || "").includes(search) ||
          guarantor.mobileNumber.includes(search)
        );
      });
    }

    // Apply sorting if provided
    if (sortConfig && sortConfig.key) {
      filteredGuarantors.sort((a: any, b: any) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (!aValue || !bValue) return 0;

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return {
      success: true,
      data: filteredGuarantors,
    };
  } catch (error) {
    console.error("Error getting guarantors:", error);
    return {
      success: false,
      message: "Failed to retrieve guarantors",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single guarantor by ID
 * @param id The guarantor ID
 */
export async function getGuarantorById(id: string) {
  try {
    const guarantor = await prisma.guarantor.findUnique({
      where: { id, deletedAt: null },
      include: {
        loanApplication: {
          include: {
            applicant: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!guarantor) {
      return {
        success: false,
        message: "Guarantor not found",
      };
    }

    return {
      success: true,
      data: guarantor,
    };
  } catch (error) {
    console.error("Error getting guarantor:", error);
    return {
      success: false,
      message: "Failed to retrieve guarantor",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing guarantor
 * @param id The guarantor ID
 * @param formData The updated guarantor data
 */
export async function updateGuarantor(id: string, formData: GuarantorFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = guarantorSchema.parse(formData);

    // Check if guarantor exists
    const existingGuarantor = await prisma.guarantor.findUnique({
      where: { id },
    });

    if (!existingGuarantor) {
      return {
        success: false,
        message: "Guarantor not found",
      };
    }

    // Update guarantor in database
    const updatedGuarantor = await prisma.guarantor.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/guarantors/list");
    revalidatePath(`/saas/guarantors/${id}`);

    return {
      success: true,
      message: "Guarantor updated successfully",
      data: updatedGuarantor,
    };
  } catch (error) {
    console.error("Error updating guarantor:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to update guarantor",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Soft delete a guarantor
 * @param id The guarantor ID
 */
export async function deleteGuarantor(id: string): Promise<ActionResponse> {
  try {
    // Check if guarantor exists
    const existingGuarantor = await prisma.guarantor.findUnique({
      where: { id },
    });

    if (!existingGuarantor) {
      return {
        success: false,
        message: "Guarantor not found",
      };
    }

    // Soft delete by setting deletedAt
    await prisma.guarantor.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/guarantors/list");

    return {
      success: true,
      message: "Guarantor deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting guarantor:", error);
    return {
      success: false,
      message: "Failed to delete guarantor",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all states for dropdown filter
 */
export async function getStates() {
  try {
    const states = await prisma.guarantor.findMany({
      where: { deletedAt: null },
      select: { addressState: true },
      distinct: ["addressState"],
    });

    return {
      success: true,
      data: states.map((s) => s.addressState),
    };
  } catch (error) {
    console.error("Error getting states:", error);
    return {
      success: false,
      message: "Failed to retrieve states",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all loan applications for dropdown selection
 */
export async function getLoanApplications() {
  try {
    const loanApplications = await prisma.loanApplication.findMany({
      where: { deletedAt: null },
      include: {
        applicant: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: loanApplications,
    };
  } catch (error) {
    console.error("Error getting loan applications:", error);
    return {
      success: false,
      message: "Failed to retrieve loan applications",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
