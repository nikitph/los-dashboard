"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";

/**
 * Soft-deletes a CoApplicant by ID
 *
 * @param {string} id - The ID of the CoApplicant to delete
 * @returns {Promise<ActionResponse<{ id: string }>>} Response indicating success or error
 *
 * @example
 * // Success case
 * const response = await deleteCoApplicant("123abc");
 * // => { success: true, message: "CoApplicant.toast.deleted", data: { id: "123abc" } }
 *
 * @example
 * // Error case - not found
 * const response = await deleteCoApplicant("invalid-id");
 * // => { success: false, message: "errors.notFound" }
 */
export async function deleteCoApplicant(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    // Get current user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check permissions
    const ability = await getAbility(user);
    if (!ability.can("delete", "CoApplicant")) {
      return { success: false, message: "errors.forbidden" };
    }

    // Check if the CoApplicant exists
    const existing = await prisma.coApplicant.findUnique({
      where: { id },
    });

    if (!existing) {
      const t = await getTranslations({ locale: "en", namespace: "CoApplicant" });
      return {
        success: false,
        message: t("errors.notFound"),
      };
    }

    // Soft delete the CoApplicant (set deletedAt)
    await prisma.coApplicant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Get translations for success message
    const t = await getTranslations({ locale: "en", namespace: "CoApplicant" });

    return {
      success: true,
      message: t("toast.deleted"),
      data: { id },
    };
  } catch (error) {
    console.error("Error deleting coApplicant:", error);
    return handleActionError({ type: "unexpected", error });
  }
}
