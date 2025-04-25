"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

// Schema for validating ID input
const deleteGuarantorSchema = z.object({
  id: z.string().min(1, { message: "guarantor.validation.id.required" }),
});

type DeleteGuarantorInput = z.infer<typeof deleteGuarantorSchema>;

/**
 * Deletes an existing guarantor from the database
 *
 * @param {DeleteGuarantorInput} data - Object containing the guarantor ID to delete
 * @returns {Promise<ActionResponse>} Response indicating success or error
 *
 * @example
 * // Success case
 * const response = await deleteGuarantor({ id: "123" });
 * // => { success: true, message: "guarantor.toast.deleted" }
 *
 * @example
 * // Error case - not found
 * const response = await deleteGuarantor({ id: "non-existent-id" });
 * // => { success: false, message: "errors.notFound" }
 */
export async function deleteGuarantor(data: DeleteGuarantorInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Validate the data
    const validation = deleteGuarantorSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const { id } = validation.data;

    // Check if the guarantor exists
    const existingGuarantor = await prisma.guarantor.findUnique({
      where: { id },
    });

    if (!existingGuarantor) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { id: "guarantor.validation.id.notFound" },
      };
    }

    // Check if user has permission to delete this guarantor
    const ability = await getAbility(user);
    if (!ability.can("delete", "Guarantor")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "guarantor" });

    // Soft delete the guarantor by setting deletedAt
    const deletedGuarantor = await prisma.guarantor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: t("toast.deleted"),
      data: deletedGuarantor,
    };
  } catch (error) {
    // Log the error
    console.error("Error deleting guarantor:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
