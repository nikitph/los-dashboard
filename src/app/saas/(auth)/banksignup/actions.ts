"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BankSchema } from "@/schemas/zodSchemas";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  signupSchema,
  SignupSchemaType,
  SubscriptionCreateInput,
  SubscriptionCreateSchema,
} from "@/app/saas/(auth)/banksignup/schema";

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

// Bank Update Schema
const BankUpdateSchema = z.object({
  contactNumber: z.string().optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  legalEntityName: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  regulatoryLicenses: z.any().optional(), // Will handle JSON conversion
});

type BankUpdateData = z.infer<typeof BankUpdateSchema>;

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
 * Update a bank's profile
 * @param id The bank ID
 * @param data The updated bank data
 */
export async function updateBank(id: string, data: BankUpdateData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = BankUpdateSchema.parse(data);

    // Check if bank exists
    const existingBank = await prisma.bank.findUnique({
      where: { id },
    });

    if (!existingBank) {
      return {
        success: false,
        message: "Bank not found",
      };
    }

    // Update bank in database
    const updatedBank = await prisma.bank.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/banks/list");
    revalidatePath(`/saas/banks/${id}`);
    revalidatePath(`/saas/banks/${id}/edit`);

    return {
      success: true,
      message: "Bank updated successfully",
      data: updatedBank,
    };
  } catch (error) {
    console.error("Error updating bank:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors,
      };
    }
    return {
      success: false,
      message: "Failed to update bank",
      errors: error instanceof Error ? error.message : "Unknown error",
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

export async function signup(formData: SignupSchemaType, bankId: string): Promise<ActionResponse> {
  try {
    const data = signupSchema.parse(formData);

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phoneNumber,
        },
      },
    });

    if (authError) {
      return {
        success: false,
        message: "Auth error",
        errors: { email: authError.message },
      };
    }

    // If sign up was successful but user needs to confirm email
    // if (authData.user && !authData.user.confirmed_at) {
    //   // Redirect to verification page or show verification message
    //   redirect("/saas/verify?email=" + encodeURIComponent(formData.email));
    // }

    // If sign up was successful and no email verification required
    if (authData?.user) {
      await prisma.userRoles.create({
        data: {
          userId: authData.user.id,
          bankId: bankId,
          role: "BANK_ADMIN",
        },
      });
      return {
        success: true,
        message: "Signup successful as a part of bank onboarding",
        data: authData.user,
      };
    }

    // If sign up was successful but no user was returned from auth
    return {
      success: false,
      message: "Unknown error occurred",
      errors: { general: "No user was returned from auth" },
    };
  } catch (error) {
    // If Zod validation fails
    if (error instanceof z.ZodError) {
      const zodErrors: Record<string, string> = {};
      error.errors.forEach((issue) => {
        const path = issue.path.join(".");
        zodErrors[path] = issue.message;
      });
      return {
        success: false,
        message: "Validation error",
        errors: zodErrors,
      };
    }
    return {
      success: false,
      message: "Server error",
      errors: {
        general: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Server action to create a new subscription
 * @param data Subscription data validated against Zod schema
 * @returns ActionResponse containing success/error status and subscription data if successful
 */
export async function createSubscription(data: SubscriptionCreateInput): Promise<ActionResponse> {
  try {
    // Validate input data using Zod schema
    const validatedData = SubscriptionCreateSchema.safeParse(data);

    if (!validatedData.success) {
      // Format Zod errors into a Record<string, string>
      const formattedErrors: Record<string, string> = {};
      validatedData.error.errors.forEach((error) => {
        const path = error.path.join(".");
        formattedErrors[path] = error.message;
      });

      return {
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      };
    }

    // Check if bank exists
    const bank = await prisma.bank.findUnique({
      where: { id: data.bankId },
    });

    if (!bank) {
      return {
        success: false,
        message: "Bank not found",
        errors: { bankId: "Bank not found" },
      };
    }

    // Check for existing active subscriptions for this bank
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        bankId: data.bankId,
        status: "Active",
      },
    });

    if (existingSubscription) {
      return {
        success: false,
        message: "An active subscription already exists for this bank",
        errors: { bankId: "Active subscription already exists" },
      };
    }

    // Create the subscription
    const subscription = await prisma.subscription.create({
      data: {
        bankId: data.bankId,
        planType: data.planType,
        billingCycle: data.billingCycle,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
      },
    });

    // // Create a subscription payment record
    // await db.payment.create({
    //   data: {
    //     subscriptionId: subscription.id,
    //     amount: data.amount,
    //     status: "Paid",
    //     paymentDate: new Date(),
    //     paymentMethod: JSON.stringify(data.paymentMethod),
    //   },
    // });

    // Update bank subscription status
    await prisma.bank.update({
      where: { id: data.bankId },
      data: {
        onboardingStatus: "SUBSCRIPTION_CREATED",
      },
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard/subscriptions");
    revalidatePath(`/dashboard/banks/${data.bankId}`);

    return {
      success: true,
      message: "Subscription created successfully",
      data: { subscription },
    };
  } catch (error) {
    console.error("Error creating subscription:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Calculate the next billing date based on billing cycle
 */
function calculateNextBillingDate(startDate: Date, billingCycle: string): Date {
  const nextDate = new Date(startDate);

  if (billingCycle === "MONTHLY") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (billingCycle === "ANNUAL") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return nextDate;
}

/**
 * Server action to cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<ActionResponse> {
  try {
    // Validate subscription ID
    if (!subscriptionId) {
      return {
        success: false,
        message: "Subscription ID is required",
        errors: { subscriptionId: "This field is required" },
      };
    }

    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return {
        success: false,
        message: "Subscription not found",
        errors: { subscriptionId: "Subscription not found" },
      };
    }

    // Update subscription status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "Cancelled",
        endDate: new Date(), // Set end date to today
      },
    });

    // Update bank subscription status
    await prisma.bank.update({
      where: { id: subscription.bankId },
      data: {
        onboardingStatus: "ADMIN_CREATED",
      },
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard/subscriptions");
    revalidatePath(`/dashboard/banks/${subscription.bankId}`);

    return {
      success: true,
      message: "Subscription cancelled successfully",
      data: { subscription: updatedSubscription },
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
