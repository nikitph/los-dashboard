"use server";

import { revalidatePath } from "next/cache";
import { undefined, z } from "zod";
import { prisma } from "@/lib/prisma";
import { InitialLoanApplicationSchema, LoanApplicationSchema } from "@/schemas/zodSchemas";
import { createClient } from "@supabase/supabase-js";

// Type for loan application input data
export type LoanApplicationFormData = z.infer<typeof LoanApplicationSchema>;
export type InitialLoanApplicationData = z.infer<typeof InitialLoanApplicationSchema> & {
  authId?: string;
};

// Response type for actions
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * TODO: This will need to be redone after phone number verification is implemented
 * Create a new loan application through initial form data
 * - Uses provided authId from client (if available)
 * - Check if user profile exists
 * - Create user profile if needed
 * - Create applicant if needed
 * - Create loan application
 */
export async function createInitialLoanApplication(formData: InitialLoanApplicationData): Promise<ActionResponse> {
  try {
    let userProfile;
    // Validate the initial form data
    const validatedData = InitialLoanApplicationSchema.parse(formData);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SERVICE_ROLE_KEY!);

    console.log("formData", validatedData);

    const { data, error } = await supabase.auth.admin.createUser({
      phone: formData.phoneNumber,
      email: formData.email,
      email_confirm: true,
    });

    // Step 1: Check if the user has a profile with our app
    userProfile = await prisma.userProfile.findUnique({
      where: { email: validatedData.email },
    });

    if (userProfile) {
      console.log("user profile already exists", userProfile);
      // Check if an applicant exist for this user with this bank
      const userRoles = await prisma.userRoles.findMany({
        where: {
          userId: userProfile.authId,
          bankId: validatedData.bankId,
          role: "APPLICANT",
        },
      });
      console.log("userRoles", userRoles);
      if (userRoles.length > 0) {
        // we have the applicant also now we need to create the loan application
        const loanApplication = await prisma.loanApplication.create({
          data: {
            applicantId: applicant.id,
            bankId: bank.id,
            loanType: validatedData.loanType,
            amountRequested: parseFloat(validatedData.requestedAmount),
            status: "PENDING",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        return { data: undefined, error: "", message: "", success: false };
      }
    }

    if (error) {
      console.error("Error creating user:", error.code);
      switch (error.code) {
        case "email_exists":
          userProfile = await prisma.userProfile.findUnique({
            where: { email: validatedData.email },
          });
          if (userProfile) {
            console.log("user profile already exists", userProfile);
            const userRoles = await prisma.userRoles.findMany({
              where: {
                userId: userProfile.authId,
                role: "USER",
              },
            });
            console.log("userRoles", userRoles);
            if (userRoles.length > 0) {
              // we have a user role. now lets check applicant

              return { data: undefined, error: "", message: "", success: false };
            }
          }
          return { data: undefined, error: "", message: "", success: false };
      }
      console.error("Error creating user:", error.code);
    }

    console.log("User created successfully:", data);

    // 1. Check if a user profile exists with the provided phone number. We will not use email address as phone number is unique

    // 2. If no user profile, create a new Supabase user and user profile
    let authId;
    if (!userProfile) {
      // Create Supabase user through dedicated API route
      const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phoneNumber: validatedData.phoneNumber,
        }),
      });

      const authResult = await authResponse.json();
      if (!authResult.success) {
        throw new Error(authResult.error || "Failed to create user in authentication system");
      }

      authId = authResult.userId;

      // Create user profile
      userProfile = await prisma.userProfile.create({
        data: {
          authId,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phoneNumber: validatedData.phoneNumber,
          isOnboarded: false,
        },
      });
    }

    // 3. Check/create APPLICANT role
    const existingRole = await prisma.userRoles.findFirst({
      where: {
        userId: userProfile.id,
        role: "APPLICANT",
      },
    });

    if (!existingRole) {
      await prisma.userRoles.create({
        data: {
          userId: userProfile.id,
          role: "APPLICANT",
        },
      });
    }

    // 4. Check/create Applicant
    let applicant = await prisma.applicant.findFirst({
      where: { userId: userProfile.id },
    });

    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: {
          userId: userProfile.id,
          dateOfBirth: new Date(), // Placeholder
          addressState: "Unknown", // Placeholder
          addressCity: "Unknown", // Placeholder
          addressFull: "Unknown", // Placeholder
          addressPinCode: "000000", // Placeholder
          aadharNumber: "000000000000", // Placeholder
          panNumber: "XXXXX0000X", // Placeholder
          aadharVerificationStatus: false,
          panVerificationStatus: false,
          photoUrl: "", // Placeholder
        },
      });
    }

    // 5. Get bank ID (assuming there's a default or first bank)
    const bank = await prisma.bank.findFirst({
      select: { id: true },
    });

    if (!bank) {
      throw new Error("No bank found in the system");
    }

    // 6. Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: {
        applicantId: applicant.id,
        bankId: bank.id,
        loanType: validatedData.loanType,
        amountRequested: parseFloat(validatedData.requestedAmount),
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/loan-applications/list");

    return {
      success: true,
      message: "Loan application created successfully",
      data: loanApplication,
    };
  } catch (error) {
    console.error("Error creating initial loan application:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to create loan application",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

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
