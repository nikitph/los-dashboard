"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";

/**
 * Soft deletes a loan application by setting deletedAt field
 *
 * @param {string} id - The ID of the loan application to delete
 * @returns {Promise<ActionResponse<any>>} Response with success message or error
 * @throws Will throw an error if user lacks permission to delete loan applications
 *
 * @example
 * // Success case
 * const response = await deleteLoanApplication("loan123");
 * // => { success: true, message: "LoanApplication.toast.deleted" }
 */
export async function deleteLoanApplication(id: string): Promise<ActionResponse<any>> {
  try {
    // Get authenticated user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user permissions
    const ability = await getAbility(user);
    if (!ability.can("delete", "LoanApplication")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "LoanApplication" });

    // Check if loan application exists
    const existingLoanApplication = await prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!existingLoanApplication) {
      return {
        success: false,
        message: t("errors.notFound"),
      };
    }

    // Soft delete (update deletedAt timestamp)
    await prisma.loanApplication.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
      message: t("toast.deleted"),
    };
  } catch (error) {
    return handleActionError({ type: "unexpected", error });
  }
}
