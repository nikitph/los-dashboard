"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { UpdateCoApplicantInput, updateCoApplicantSchema } from "../schemas/coApplicantSchema";

/**
 * Updates an existing CoApplicant in the database
 *
 * @param {UpdateCoApplicantInput} data - The co-applicant data to update, including the ID
 * @returns {Promise<ActionResponse<any>>} Response with updated co-applicant or error
 *
 * @example
 * // Success case
 * const response = await updateCoApplicant({
 *   id: "123abc",
 *   firstName: "Updated Name",
 *   // ... other fields to update
 * });
 * // => { success: true, message: "CoApplicant.toast.updated", data: { id: "123abc", firstName: "Updated Name", ... } }
 *
 * @example
 * // Error case - validation failure
 * const response = await updateCoApplicant({
 *   id: "123abc",
 *   email: "invalid-email"
 * });
 * // => { success: false, message: "errors.validationFailed", errors: { email: "validation.email.invalid" } }
 */
export async function updateCoApplicant(data: UpdateCoApplicantInput): Promise<ActionResponse<any>> {
  try {
    // Get current user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check permissions
    const ability = await getAbility(user);
    if (!ability.can("update", "CoApplicant")) {
      return { success: false, message: "errors.forbidden" };
    }

    // Validate input data
    const validation = updateCoApplicantSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const { id, ...updateData } = validation.data;

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

    // Update the CoApplicant
    const updatedCoApplicant = await prisma.coApplicant.update({
      where: { id },
      data: updateData,
    });

    // Get translations for success message
    const t = await getTranslations({ locale: "en", namespace: "CoApplicant" });

    return {
      success: true,
      message: t("toast.updated"),
      data: updatedCoApplicant,
    };
  } catch (error) {
    console.error("Error updating coApplicant:", error);
    return handleActionError({ type: "unexpected", error });
  }
}
