"use server";

import { prisma } from "@/lib/prisma";

import { createClient } from "@supabase/supabase-js";
import { createUserSchema, UserData, UserRecord } from "@/app/[locale]/saas/(private)/users/schema";
import { getFormTranslation } from "@/utils/serverTranslationUtil";
import { revalidatePath } from "next/cache";
import { handleActionError } from "@/lib/actionErrorHelpers";
import { ActionResponse } from "@/types/globalTypes";

export async function getUsersForBank(bankId: string): Promise<UserRecord[]> {
  const userProfiles = await prisma.userRoles.findMany({
    where: { bankId },
    include: {
      user: true,
    },
  });

  return userProfiles.map((userRole) => ({
    id: userRole.userId,
    firstName: userRole.user.firstName ?? "",
    lastName: userRole.user.lastName ?? "",
    email: userRole.user.email ?? "",
    role: userRole.role,
    status: "Active",
    lastLogin: "N/A",
    branch: userRole.bankId ? "Main Branch" : "Unknown",
    avatarUrl: undefined,
  }));
}

export async function createUser(formData: UserData, locale: string): Promise<ActionResponse> {
  try {
    const { validation, errors, toast } = await getFormTranslation("UserCreateForm", locale);
    const userSchema = createUserSchema(validation);

    // Validate the input data
    const validatedData = userSchema.parse(formData);

    // Check if the bank exists
    const bank = await prisma.bank.findUnique({
      where: { id: validatedData.bankId, deletedAt: null },
    });

    if (!bank) {
      return {
        success: false,
        message: errors("bankNotFound"),
        errors: { bankId: errors("bankNotFound") },
      };
    }

    // Create user in Supabase Auth
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SERVICE_ROLE_KEY!);

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
          message: errors("userExists"),
          errors: { email: errors("userExists") },
        };
      }

      if (authError.code?.includes("phone_exists")) {
        return {
          success: false,
          message: errors("phoneExists"),
          errors: { phoneNumber: errors("phoneExists") },
        };
      }

      return {
        success: false,
        message: errors("createFailed"),
        errors: { root: authError.message },
      };
    }

    if (!authData?.user?.id) {
      return {
        success: false,
        message: errors("unexpected"),
        errors: { root: errors("unexpected") },
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

    revalidatePath("/saas/users/list");

    return {
      success: true,
      message: toast("successDescription"),
      data: {
        id: authData.user.id,
        ...validatedData,
      },
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return handleActionError(error);
  }
}
