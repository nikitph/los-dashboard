"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { createClient } from "@/lib/supabase/server";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { CreateUserInput, createUserSchema } from "../schemas/userSchema";

/**
 * Creates a new user in the system (Supabase Auth + Database)
 *
 * @param {CreateUserInput} data - The user data to create
 * @returns {Promise<ActionResponse>} Response with created user or error details
 *
 * @example
 * // Success case
 * const response = await createUser({
 *   firstName: "John",
 *   lastName: "Doe",
 *   email: "john@example.com",
 *   phoneNumber: "1234567890",
 *   role: "LOAN_OFFICER",
 *   bankId: "bank123"
 * });
 * // => { success: true, message: "Users.toast.created", data: { id: "123", ... } }
 *
 * @example
 * // Error case - validation failure
 * const response = await createUser({ firstName: "" });
 * // => {
 * //   success: false,
 * //   message: "errors.validationFailed",
 * //   errors: { firstName: "Users.validation.firstName.required" }
 * // }
 */
export async function createUser(data: CreateUserInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check if user has permission to create users
    const ability = await getAbility(user);
    if (!ability.can("create", "UserProfile")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "Users" });

    // Validate the data
    const validation = createUserSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const validatedData = validation.data;

    // Check if the bank exists
    const bank = await prisma.bank.findUnique({
      where: { id: validatedData.bankId, deletedAt: null },
    });

    if (!bank) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { bankId: "Users.validation.bankId.notFound" },
      };
    }

    // Create user in Supabase Auth
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      phone: validatedData.phoneNumber,
      email_confirm: true,
      user_metadata: {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        phone: validatedData.phoneNumber,
      },
    });

    if (authError) {
      if (authError.message.includes("already exists")) {
        return {
          success: false,
          message: "errors.alreadyExists",
          errors: { email: "Users.validation.email.alreadyExists" },
        };
      }

      if (authError.code?.includes("phone_exists")) {
        return {
          success: false,
          message: "errors.alreadyExists",
          errors: { phoneNumber: "Users.validation.phoneNumber.alreadyExists" },
        };
      }

      return {
        success: false,
        message: "errors.createFailed",
        errors: { root: authError.message },
      };
    }

    if (!authData?.user?.id) {
      return {
        success: false,
        message: "errors.unexpected",
        errors: { root: "Users.errors.unexpected" },
      };
    }

    // Create the UserRoles record for that user
    if (authData?.user?.id) {
      await prisma.userRoles.create({
        data: {
          userId: authData.user.id,
          role: validatedData.role,
          bankId: validatedData.bankId,
          assignedAt: new Date(),
        },
      });
    }

    // Revalidate user list path to refresh the UI
    revalidatePath(`/${user.currentRole.bankId}/saas/users/list`);

    return {
      success: true,
      message: t("toast.created"),
      data: {
        id: authData.user.id,
        ...validatedData,
      },
    };
  } catch (error) {
    // Log the error
    console.error("Error creating user:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
