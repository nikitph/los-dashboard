"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { UpdateGuarantorInput, updateGuarantorSchema } from "../schemas/guarantorSchema";

/**
 * Updates an existing guarantor in the database
 *
 * @param {UpdateGuarantorInput} data - The guarantor data to update
 * @returns {Promise<ActionResponse>} Response with updated guarantor or error details
 *
 * @example
 * // Success case
 * const response = await updateGuarantor({
 *   id: "123",
 *   firstName: "Updated Name",
 *   email: "updated@example.com",
 * });
 * // => { success: true, message: "guarantor.toast.updated", data: { id: "123", ... } }
 *
 * @example
 * // Error case - not found
 * const response = await updateGuarantor({ id: "non-existent-id" });
 * // => { success: false, message: "errors.notFound" }
 */
export async function updateGuarantor(data: UpdateGuarantorInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Validate the data
    const validation = updateGuarantorSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    // Check if the guarantor exists
    const existingGuarantor = await prisma.guarantor.findUnique({
      where: { id: data.id },
    });

    if (!existingGuarantor) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { id: "guarantor.validation.id.notFound" },
      };
    }

    // Check if user has permission to update this guarantor
    const ability = await getAbility(user);
    if (!ability.can("update", "Guarantor")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "guarantor" });

    // Extract id and prepare data for update
    const { id, ...updateData } = validation.data;

    // Update the guarantor
    const updatedGuarantor = await prisma.guarantor.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: t("toast.updated"),
      data: updatedGuarantor,
    };
  } catch (error) {
    // Log the error
    console.error("Error updating guarantor:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
