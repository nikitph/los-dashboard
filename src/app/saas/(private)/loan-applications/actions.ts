"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { LoanApplicationSchema } from "@/schemas/zodSchemas";

// Type for loan application input data
export type LoanApplicationFormData = z.infer<typeof LoanApplicationSchema>;

// Response type for actions
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * Create a new loan application
 * @param formData The loan application data
 */
export async function createLoanApplication(formData: LoanApplicationFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = LoanApplicationSchema.parse(formData);

    // Create loan application in database
    const loanApplication = await prisma.loanApplication.create({
      data: {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Revalidate the loan applications list path
    revalidatePath("/saas/loan-applications/list");

    return {
      success: true,
      message: "Loan application created successfully",
      data: loanApplication,
    };
  } catch (error) {
    console.error("Error creating loan application:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to wizard loan application",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all loan applications with optional filtering and sorting
 */
export async function getLoanApplications(
  searchTerm = "",
  statusFilter = "all",
  typeFilter = "all",
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  },
) {
  try {
    // Build filter conditions
    const filters: any = {
      deletedAt: null, // Only get non-deleted loan applications
    };

    // Add status filter if specified
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }

    // Add type filter if specified
    if (typeFilter !== "all") {
      filters.loanType = typeFilter;
    }

    // Get loan applications with filters
    const loanApplications = await prisma.loanApplication.findMany({
      where: filters,
      include: {
        applicant: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
        bank: true,
        documents: true,
        verifications: true,
        guarantors: true,
      },
    });

    // Apply search filter if provided
    let filteredApplications = loanApplications;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredApplications = loanApplications.filter((application) => {
        return (
          application.applicant?.user?.firstName?.toLowerCase().includes(search) ||
          application.applicant?.user?.lastName?.toLowerCase().includes(search) ||
          application.applicant?.user?.email?.toLowerCase().includes(search) ||
          application.applicant?.user?.phoneNumber?.includes(search) ||
          application.bank?.name.toLowerCase().includes(search) ||
          application.loanType.toLowerCase().includes(search) ||
          application.status.toLowerCase().includes(search)
        );
      });
    }

    // Apply sorting if provided
    if (sortConfig && sortConfig.key) {
      filteredApplications.sort((a: any, b: any) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (!aValue || !bValue) return 0;

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return {
      success: true,
      data: filteredApplications,
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

/**
 * Get a single loan application by ID
 * @param id The loan application ID
 */
export async function getLoanApplicationById(id: string) {
  try {
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id, deletedAt: null },
      include: {
        applicant: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
        bank: true,
        documents: true,
        verifications: true,
        guarantors: true,
        coApplicants: true,
      },
    });

    if (!loanApplication) {
      return {
        success: false,
        message: "Loan application not found",
      };
    }

    return {
      success: true,
      data: loanApplication,
    };
  } catch (error) {
    console.error("Error getting loan application:", error);
    return {
      success: false,
      message: "Failed to retrieve loan application",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing loan application
 * @param id The loan application ID
 * @param formData The updated loan application data
 */
export async function updateLoanApplication(id: string, formData: LoanApplicationFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = LoanApplicationSchema.parse(formData);

    // Check if loan application exists
    const existingLoanApplication = await prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!existingLoanApplication) {
      return {
        success: false,
        message: "Loan application not found",
      };
    }

    // Update loan application in database
    const updatedLoanApplication = await prisma.loanApplication.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/loan-applications/list");
    revalidatePath(`/saas/loan-applications/${id}`);

    return {
      success: true,
      message: "Loan application updated successfully",
      data: updatedLoanApplication,
    };
  } catch (error) {
    console.error("Error updating loan application:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to update loan application",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Soft delete a loan application
 * @param id The loan application ID
 */
export async function deleteLoanApplication(id: string): Promise<ActionResponse> {
  try {
    // Check if loan application exists
    const existingLoanApplication = await prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!existingLoanApplication) {
      return {
        success: false,
        message: "Loan application not found",
      };
    }

    // Soft delete by setting deletedAt
    await prisma.loanApplication.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/loan-applications/list");

    return {
      success: true,
      message: "Loan application deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting loan application:", error);
    return {
      success: false,
      message: "Failed to delete loan application",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all loan types for dropdown filter
 */
export async function getLoanTypes() {
  try {
    // Using Prisma's distinct to get unique loan types
    const types = await prisma.loanApplication.findMany({
      where: { deletedAt: null },
      select: { loanType: true },
      distinct: ["loanType"],
    });

    return {
      success: true,
      data: types.map((t) => t.loanType),
    };
  } catch (error) {
    console.error("Error getting loan types:", error);
    return {
      success: false,
      message: "Failed to retrieve loan types",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all banks for dropdown selection
 */
export async function getBanks() {
  try {
    const banks = await prisma.bank.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
    });

    return {
      success: true,
      data: banks,
    };
  } catch (error) {
    console.error("Error getting banks:", error);
    return {
      success: false,
      message: "Failed to retrieve banks",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all applicants for dropdown selection
 */
export async function getApplicants() {
  try {
    const applicants = await prisma.applicant.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      success: true,
      data: applicants,
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
