"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { coApplicantSchema } from "@/schemas/zodSchemas";

// Type for co-applicant input data
export type CoApplicantFormData = z.infer<typeof coApplicantSchema>;

// Response type for actions
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * Create a new co-applicant
 * @param formData The co-applicant data
 */
export async function createCoApplicant(formData: CoApplicantFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = coApplicantSchema.parse(formData);

    // Create co-applicant in database
    const coApplicant = await prisma.coApplicant.create({
      data: {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Revalidate the co-applicants list path
    revalidatePath("/saas/co-applicants/list");

    return {
      success: true,
      message: "Co-applicant created successfully",
      data: coApplicant,
    };
  } catch (error) {
    console.error("Error creating co-applicant:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to create co-applicant",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all co-applicants with optional filtering and sorting
 */
export async function getCoApplicants(
  searchTerm = "",
  loanApplicationFilter = "all",
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  },
) {
  try {
    // Build filter conditions
    const filters: any = {
      deletedAt: null, // Only get non-deleted co-applicants
    };

    // Add loan application filter if specified
    if (loanApplicationFilter !== "all") {
      filters.loanApplicationId = loanApplicationFilter;
    }

    // Get co-applicants with filters
    const coApplicants = await prisma.coApplicant.findMany({
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
    let filteredCoApplicants = coApplicants;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredCoApplicants = coApplicants.filter((coApplicant) => {
        return (
          coApplicant.firstName.toLowerCase().includes(search) ||
          coApplicant.lastName.toLowerCase().includes(search) ||
          coApplicant.email.toLowerCase().includes(search) ||
          coApplicant.addressState.toLowerCase().includes(search) ||
          coApplicant.addressCity.toLowerCase().includes(search) ||
          coApplicant.addressZipCode.includes(search) ||
          coApplicant.addressLine1.toLowerCase().includes(search) ||
          (coApplicant.addressLine2?.toLowerCase() || "").includes(search) ||
          coApplicant.mobileNumber.includes(search)
        );
      });
    }

    // Apply sorting if provided
    if (sortConfig && sortConfig.key) {
      filteredCoApplicants.sort((a: any, b: any) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (!aValue || !bValue) return 0;

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return {
      success: true,
      data: filteredCoApplicants,
    };
  } catch (error) {
    console.error("Error getting co-applicants:", error);
    return {
      success: false,
      message: "Failed to retrieve co-applicants",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single co-applicant by ID
 * @param id The co-applicant ID
 */
export async function getCoApplicantById(id: string) {
  try {
    const coApplicant = await prisma.coApplicant.findUnique({
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

    if (!coApplicant) {
      return {
        success: false,
        message: "Co-applicant not found",
      };
    }

    return {
      success: true,
      data: coApplicant,
    };
  } catch (error) {
    console.error("Error getting co-applicant:", error);
    return {
      success: false,
      message: "Failed to retrieve co-applicant",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing co-applicant
 * @param id The co-applicant ID
 * @param formData The updated co-applicant data
 */
export async function updateCoApplicant(id: string, formData: CoApplicantFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = coApplicantSchema.parse(formData);

    // Check if co-applicant exists
    const existingCoApplicant = await prisma.coApplicant.findUnique({
      where: { id },
    });

    if (!existingCoApplicant) {
      return {
        success: false,
        message: "Co-applicant not found",
      };
    }

    // Update co-applicant in database
    const updatedCoApplicant = await prisma.coApplicant.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/co-applicants/list");
    revalidatePath(`/saas/co-applicants/${id}`);

    return {
      success: true,
      message: "Co-applicant updated successfully",
      data: updatedCoApplicant,
    };
  } catch (error) {
    console.error("Error updating co-applicant:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to update co-applicant",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Soft delete a co-applicant
 * @param id The co-applicant ID
 */
export async function deleteCoApplicant(id: string): Promise<ActionResponse> {
  try {
    // Check if co-applicant exists
    const existingCoApplicant = await prisma.coApplicant.findUnique({
      where: { id },
    });

    if (!existingCoApplicant) {
      return {
        success: false,
        message: "Co-applicant not found",
      };
    }

    // Soft delete by setting deletedAt
    await prisma.coApplicant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/co-applicants/list");

    return {
      success: true,
      message: "Co-applicant deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting co-applicant:", error);
    return {
      success: false,
      message: "Failed to delete co-applicant",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all states for dropdown filter
 */
export async function getStates() {
  try {
    const states = await prisma.coApplicant.findMany({
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
