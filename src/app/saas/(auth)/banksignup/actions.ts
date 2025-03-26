"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BankSchema } from "@/schemas/zodSchemas";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// Define the type for bank input data
export type BankFormData = z.infer<typeof BankSchema>;

// Create simplified type for the minimum required fields
export type BankCreateInput = Pick<BankFormData, "name" | "officialEmail">;

// Response type for actions
type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
  errors?: Record<string, string>;
};

/**
 * Create a new bank with basic information
 * @param formData Bank creation data with required fields
 */
export async function createBank(formData: BankCreateInput): Promise<ActionResponse> {
  try {
    // Create validation schema for the minimum required fields
    const createBankSchema = z.object({
      name: BankSchema.shape.name,
      officialEmail: BankSchema.shape.officialEmail,
    });

    // Validate form data
    const validatedData = createBankSchema.parse(formData);

    // Check if a bank with the same email already exists
    const existingBank = await prisma.bank.findFirst({
      where: {
        officialEmail: validatedData.officialEmail,
        deletedAt: null,
      },
    });

    if (existingBank) {
      return {
        success: false,
        message: "A bank with this email already exists",
        errors: {
          officialEmail: "A bank with this email already exists",
        },
      };
    }

    // Create bank in database with default onboarding status
    const bank = await prisma.bank.create({
      data: {
        name: validatedData.name,
        officialEmail: validatedData.officialEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Revalidate the banks list path
    revalidatePath("/saas/banks/list");

    return {
      success: true,
      message: "Bank created successfully",
      data: bank,
    };
  } catch (error) {
    console.error("Error creating bank:", error);
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return {
        success: false,
        message: "Validation failed",
        errors,
      };
    }

    return {
      success: false,
      message: "Failed to create bank",
      errors: {
        general: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Get all banks with optional filtering and sorting
 */
export async function getBanks(
  searchTerm = "",
  onboardingStatusFilter = "all",
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  },
): Promise<ActionResponse> {
  try {
    // Build filter conditions
    const filters: any = {
      deletedAt: null, // Only get non-deleted banks
    };

    // Add onboarding status filter if specified
    if (onboardingStatusFilter !== "all") {
      filters.onboardingStatus = onboardingStatusFilter;
    }

    // Get banks with filters
    const banks = await prisma.bank.findMany({
      where: filters,
      orderBy: sortConfig?.key
        ? {
            [sortConfig.key]: sortConfig.direction,
          }
        : {
            createdAt: "desc", // Default to newest first
          },
    });

    // Apply search filter if provided
    let filteredBanks = banks;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredBanks = banks.filter((bank) => {
        return (
          bank.name.toLowerCase().includes(search) ||
          bank.officialEmail.toLowerCase().includes(search) ||
          (bank.contactNumber && bank.contactNumber.includes(search)) ||
          (bank.city && bank.city.toLowerCase().includes(search)) ||
          (bank.state && bank.state.toLowerCase().includes(search))
        );
      });
    }

    return {
      success: true,
      data: filteredBanks,
    };
  } catch (error) {
    console.error("Error getting banks:", error);
    return {
      success: false,
      message: "Failed to retrieve banks",
      errors: {
        general: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Get a single bank by ID
 * @param id The bank ID
 */
export async function getBankById(id: string): Promise<ActionResponse> {
  try {
    const bank = await prisma.bank.findUnique({
      where: { id, deletedAt: null },
    });

    if (!bank) {
      return {
        success: false,
        message: "Bank not found",
      };
    }

    return {
      success: true,
      data: bank,
    };
  } catch (error) {
    console.error("Error getting bank:", error);
    return {
      success: false,
      message: "Failed to retrieve bank",
      errors: {
        general: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Update an existing bank
 * @param id The bank ID
 * @param formData The updated bank data
 */
export async function updateBank(id: string, formData: Partial<BankFormData>): Promise<ActionResponse> {
  try {
    // Check if bank exists
    const existingBank = await prisma.bank.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingBank) {
      return {
        success: false,
        message: "Bank not found",
      };
    }

    // Create a validation schema for the update
    // Only validate fields that are provided in the update
    const updateSchema = z.object({
      name: BankSchema.shape.name.optional(),
      officialEmail: BankSchema.shape.officialEmail.optional(),
      contactNumber: BankSchema.shape.contactNumber.optional(),
      addressLine: BankSchema.shape.addressLine.optional(),
      city: BankSchema.shape.city.optional(),
      state: BankSchema.shape.state.optional(),
      zipCode: BankSchema.shape.zipCode.optional(),
      legalEntityName: BankSchema.shape.legalEntityName.optional(),
      gstNumber: BankSchema.shape.gstNumber.optional(),
      panNumber: BankSchema.shape.panNumber.optional(),
      onboardingStatus: BankSchema.shape.onboardingStatus.optional(),
    });

    // Validate form data
    const validatedData = updateSchema.parse(formData);

    // If updating email, check if it's already in use by another bank
    if (validatedData.officialEmail && validatedData.officialEmail !== existingBank.officialEmail) {
      const emailExists = await prisma.bank.findFirst({
        where: {
          officialEmail: validatedData.officialEmail,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (emailExists) {
        return {
          success: false,
          message: "A bank with this email already exists",
          errors: {
            officialEmail: "A bank with this email already exists",
          },
        };
      }
    }

    // Update bank in database
    const updatedBank = await prisma.bank.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/banks/list");
    revalidatePath(`/saas/banks/${id}`);

    return {
      success: true,
      message: "Bank updated successfully",
      data: updatedBank,
    };
  } catch (error) {
    console.error("Error updating bank:", error);
    if (error instanceof z.ZodError) {
      // Format ZodError for client-side display
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return {
        success: false,
        message: "Validation failed",
        errors,
      };
    }

    return {
      success: false,
      message: "Failed to update bank",
      errors: {
        general: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Soft delete a bank
 * @param id The bank ID
 */
export async function deleteBank(id: string): Promise<ActionResponse> {
  try {
    // Check if bank exists
    const existingBank = await prisma.bank.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingBank) {
      return {
        success: false,
        message: "Bank not found",
      };
    }

    // Soft delete by setting deletedAt
    await prisma.bank.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/banks/list");

    return {
      success: true,
      message: "Bank deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting bank:", error);
    return {
      success: false,
      message: "Failed to delete bank",
      errors: {
        general: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Update bank onboarding status
 * @param id The bank ID
 * @param status The new onboarding status
 */
export async function updateBankOnboardingStatus(
  id: string,
  status: z.infer<typeof BankSchema>["onboardingStatus"],
): Promise<ActionResponse> {
  try {
    // Check if bank exists
    const existingBank = await prisma.bank.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingBank) {
      return {
        success: false,
        message: "Bank not found",
      };
    }

    // Update onboarding status
    const updatedBank = await prisma.bank.update({
      where: { id },
      data: {
        onboardingStatus: status,
        updatedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/banks/list");
    revalidatePath(`/saas/banks/${id}`);

    return {
      success: true,
      message: "Bank onboarding status updated successfully",
      data: updatedBank,
    };
  } catch (error) {
    console.error("Error updating bank onboarding status:", error);
    return {
      success: false,
      message: "Failed to update bank onboarding status",
      errors: {
        general: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

export async function signup(
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
  },
  setCurrentStep: (arg0: number) => void,
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phoneNumber,
      },
    },
  });

  if (authError) {
    return {
      error: authError.message,
      code: authError.code,
      status: authError.status,
    };
  }

  // If sign up was successful but user needs to confirm email
  // if (authData.user && !authData.user.confirmed_at) {
  //   // Redirect to verification page or show verification message
  //   redirect("/saas/verify?email=" + encodeURIComponent(formData.email));
  // }

  // If sign up was successful and no email verification required
  if (authData.user) {
    return {
      success: true,
      message: "Bank onboarding status updated successfully",
    };
  }

  return { error: "An unexpected error occurred", code: "unknown_error", status: 500 };
}
