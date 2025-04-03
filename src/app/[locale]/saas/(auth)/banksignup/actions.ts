"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

import {
  BankCreateInput,
  BankUpdateData,
  BankUpdateSchema,
  createBankSchema,
  createSignupSchema,
  SignupSchemaType,
  SubscriptionCreateInput,
  SubscriptionCreateSchema
} from "@/app/[locale]/saas/(auth)/banksignup/schema";

import { BankSchema } from "@/schemas/zodSchemas";
import { ActionResponse } from "@/types/globalTypes";
import { handleActionError } from "@/lib/actionErrorHelpers";
import { getMessages } from "next-intl/server";
import { createTranslator } from "next-intl";

/**
 * Create a new bank with basic information
 * @param formData Bank creation data with required fields
 * @param locale Current locale
 */
export async function createBank(formData: BankCreateInput, locale: string): Promise<ActionResponse> {
  try {
    const messages = await getMessages({ locale }); // pulls from current context
    const t = createTranslator({ locale, messages, namespace: "BankCreationForm" });
    const v = createTranslator({ locale, messages, namespace: "validation" });
    const bankCreateSchema = createBankSchema(v);
    const validatedData = bankCreateSchema.parse(formData);

    const existingBank = await prisma.bank.findFirst({
      where: {
        officialEmail: validatedData.officialEmail,
        deletedAt: null,
      },
    });

    if (existingBank) {
      return {
        success: false,
        message: t("errors.bankExists"),
        errors: {
          email: t("errors.bankExists"),
        },
      };
    }

    const bank = await prisma.bank.create({
      data: {
        name: validatedData.name,
        officialEmail: validatedData.officialEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/saas/banks/list");

    return {
      success: true,
      message: t("success.created"),
      data: bank,
    };
  } catch (error) {
    console.error("Error creating bank:", error);
    return handleActionError(error);
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
    const filters: any = {
      deletedAt: null,
    };

    if (onboardingStatusFilter !== "all") {
      filters.onboardingStatus = onboardingStatusFilter;
    }

    const banks = await prisma.bank.findMany({
      where: filters,
      orderBy: sortConfig?.key
        ? {
            [sortConfig.key]: sortConfig.direction,
          }
        : {
            createdAt: "desc",
          },
    });

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
      message: "Bank list fetched successfully",
      data: filteredBanks,
    };
  } catch (error) {
    console.error("Error getting banks:", error);
    return handleActionError(error);
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
        errors: {
          root: "Bank not found",
        },
      };
    }

    return {
      success: true,
      message: "Bank returned successfully",
      data: bank,
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Update a bank's profile
 * @param id The bank ID
 * @param data The updated bank data
 */
export async function updateBank(id: string, data: BankUpdateData): Promise<ActionResponse> {
  try {
    const validatedData = BankUpdateSchema.parse(data);

    const existingBank = await prisma.bank.findUnique({ where: { id } });

    if (!existingBank) {
      return {
        success: false,
        message: "Bank not found",
        errors: {
          root: "Bank not found",
        },
      };
    }

    const updatedBank = await prisma.bank.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

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
    return handleActionError(error);
  }
}

/**
 * Soft delete a bank
 * @param id The bank ID
 */
export async function deleteBank(id: string): Promise<ActionResponse> {
  try {
    const existingBank = await prisma.bank.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingBank) {
      return {
        success: false,
        message: "Bank not found",
        errors: { root: "Bank not found" },
      };
    }

    await prisma.bank.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    revalidatePath("/saas/banks/list");

    return {
      success: true,
      message: "Bank deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting bank:", error);
    return handleActionError(error);
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
    const existingBank = await prisma.bank.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingBank) {
      return {
        success: false,
        message: "Bank not found",
        errors: { root: "Bank not found" },
      };
    }

    const updatedBank = await prisma.bank.update({
      where: { id },
      data: {
        onboardingStatus: status,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/saas/banks/list");
    revalidatePath(`/saas/banks/${id}`);

    return {
      success: true,
      message: "Bank onboarding status updated successfully",
      data: updatedBank,
    };
  } catch (error) {
    console.error("Error updating onboarding status:", error);
    return handleActionError(error);
  }
}

export async function signup(formData: SignupSchemaType, bankId: string, locale: string): Promise<ActionResponse> {
  try {
    const messages = await getMessages({ locale }); // pulls from current context
    const t = createTranslator({ locale, messages, namespace: "BankSignupForm" });
    const v = createTranslator({ locale, messages, namespace: "validation" });
    const signupSchema = createSignupSchema(v);
    const validatedData = signupSchema.parse(formData);

    const data = signupSchema.parse(validatedData);

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
        message: t("errors.authError"),
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
        message: t("success.adminCreated"),
        data: authData.user,
      };
    }

    // If sign up was successful but no user was returned from auth
    return {
      success: false,
      message: t("errors.unknownError"),
      errors: { root: t("errors.noUser") },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Server action to create a new subscription
 * @param data Subscription data validated against Zod schema
 * @returns ActionResponse containing success/error status and subscription data if successful
 */
export async function createSubscription(data: SubscriptionCreateInput): Promise<ActionResponse> {
  try {
    const validated = SubscriptionCreateSchema.safeParse(data);
    if (!validated.success) return handleActionError(validated.error);

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
        message: "An active subscription already exists",
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

    await prisma.bank.update({
      where: { id: data.bankId },
      data: {
        onboardingStatus: "SUBSCRIPTION_CREATED",
      },
    });

    revalidatePath("/dashboard/subscriptions");
    revalidatePath(`/dashboard/banks/${data.bankId}`);

    return {
      success: true,
      message: "Subscription created successfully",
      data: { subscription },
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return handleActionError(error);
  }
}

/**
 * Server action to cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<ActionResponse> {
  try {
    if (!subscriptionId) {
      return {
        success: false,
        message: "Subscription ID is required",
        errors: { subscriptionId: "This field is required" },
      };
    }

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

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "Cancelled",
        endDate: new Date(),
      },
    });

    await prisma.bank.update({
      where: { id: subscription.bankId },
      data: {
        onboardingStatus: "ADMIN_CREATED",
      },
    });

    revalidatePath("/dashboard/subscriptions");
    revalidatePath(`/dashboard/banks/${subscription.bankId}`);

    return {
      success: true,
      message: "Subscription cancelled successfully",
      data: { subscription: updatedSubscription },
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return handleActionError(error);
  }
}
