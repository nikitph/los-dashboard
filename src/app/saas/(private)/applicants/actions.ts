"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApplicantSchema } from "@/schemas/zodSchemas";

// Type for applicants input data
export type ApplicantFormData = z.infer<typeof ApplicantSchema>;

// Response type for actions
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

// Create new applicants
export async function createApplicant(formData: ApplicantFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = ApplicantSchema.parse(formData);

    // Create applicants in database
    const applicant = await prisma.applicant.create({
      //ts-ignore
      data: {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Revalidate the applicants list path
    revalidatePath("/saas/applicants/list");

    return {
      success: true,
      message: "Applicant created successfully",
      data: applicant,
    };
  } catch (error) {
    console.error("Error creating applicants:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to create applicants",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get all applicants with optional filtering and sorting
export async function getApplicants(
  searchTerm = "",
  stateFilter = "all",
  verificationFilter = "all",
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  },
) {
  try {
    // Build filter conditions
    const filters: any = {
      deletedAt: null, // Only get non-deleted applicants
    };

    // Add state filter if specified
    if (stateFilter !== "all") {
      filters.addressState = stateFilter;
    }

    // Add verification filter if specified
    if (verificationFilter === "verified") {
      filters.aadharVerificationStatus = true;
      filters.panVerificationStatus = true;
    } else if (verificationFilter === "unverified") {
      filters.OR = [{ aadharVerificationStatus: false }, { panVerificationStatus: false }];
    }

    // Get applicants with filters
    const applicants = await prisma.applicant.findMany({
      where: filters,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    // Apply search filter if provided
    let filteredApplicants = applicants;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredApplicants = applicants.filter((applicant) => {
        return (
          applicant.addressCity.toLowerCase().includes(search) ||
          applicant.addressState.toLowerCase().includes(search) ||
          applicant.addressFull.toLowerCase().includes(search) ||
          applicant.aadharNumber.includes(search) ||
          applicant.panNumber.toLowerCase().includes(search) ||
          applicant.user?.email?.toLowerCase().includes(search) ||
          applicant.user?.firstName?.toLowerCase().includes(search) ||
          applicant.user?.lastName?.toLowerCase().includes(search) ||
          applicant.user?.phoneNumber?.includes(search)
        );
      });
    }

    // Apply sorting if provided
    if (sortConfig && sortConfig.key) {
      filteredApplicants.sort((a: any, b: any) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (!aValue || !bValue) return 0;

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return {
      success: true,
      data: filteredApplicants,
    };
  } catch (error) {
    console.error("Error getting applicants:", error);
    return {
      success: false,
      message: "Failed to retrieve applicants",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get a single applicants by ID
export async function getApplicantById(id: string) {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        loanApplications: true,
      },
    });

    if (!applicant) {
      return {
        success: false,
        message: "Applicant not found",
      };
    }

    return {
      success: true,
      data: applicant,
    };
  } catch (error) {
    console.error("Error getting applicants:", error);
    return {
      success: false,
      message: "Failed to retrieve applicants",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateApplicant(id: string, formData: ApplicantFormData): Promise<ActionResponse> {
  try {
    console.log("validated data 1");
    // Validate form data
    const validatedData = ApplicantSchema.parse(formData);
    console.log("validated data 2");

    // Check if applicant exists
    const existingApplicant = await prisma.applicant.findUnique({
      where: { id },
    });

    console.log("validated data 3");

    if (!existingApplicant) {
      return {
        success: false,
        message: "Applicant not found",
      };
    }

    // Clean up photoUrl if it contains nested quotes
    let cleanPhotoUrl = validatedData.photoUrl;
    if (typeof cleanPhotoUrl === "string") {
      if (cleanPhotoUrl === '""' || cleanPhotoUrl === "'\"\"'") {
        cleanPhotoUrl = ""; // Replace with empty string
      } else if (cleanPhotoUrl.startsWith('"') && cleanPhotoUrl.endsWith('"')) {
        cleanPhotoUrl = cleanPhotoUrl.slice(1, -1); // Remove surrounding quotes
      }
    }

    console.log("validated data", {
      ...validatedData,
      photoUrl: cleanPhotoUrl,
    });

    // Update applicant in database - only update the fields that come from the form
    const updatedApplicant = await prisma.applicant.update({
      where: { id },
      data: {
        userId: validatedData.userId,
        dateOfBirth:
          validatedData.dateOfBirth instanceof Date ? validatedData.dateOfBirth : new Date(validatedData.dateOfBirth),
        addressState: validatedData.addressState,
        addressCity: validatedData.addressCity,
        addressFull: validatedData.addressFull,
        addressPinCode: validatedData.addressPinCode,
        aadharNumber: validatedData.aadharNumber,
        panNumber: validatedData.panNumber,
        aadharVerificationStatus: Boolean(validatedData.aadharVerificationStatus),
        panVerificationStatus: Boolean(validatedData.panVerificationStatus),
        photoUrl: cleanPhotoUrl,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/applicants/list");
    revalidatePath(`/saas/applicants/${id}`);

    return {
      success: true,
      message: "Applicant updated successfully",
      data: updatedApplicant,
    };
  } catch (error) {
    console.error("Error updating applicant:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to update applicant",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Soft delete an applicants
export async function deleteApplicant(id: string): Promise<ActionResponse> {
  try {
    // Check if applicants exists
    const existingApplicant = await prisma.applicant.findUnique({
      where: { id },
    });

    if (!existingApplicant) {
      return {
        success: false,
        message: "Applicant not found",
      };
    }

    // Soft delete by setting deletedAt
    await prisma.applicant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/applicants/list");

    return {
      success: true,
      message: "Applicant deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting applicants:", error);
    return {
      success: false,
      message: "Failed to delete applicants",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get all states for dropdown filter
export async function getStates() {
  try {
    const states = await prisma.applicant.findMany({
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
