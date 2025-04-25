"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { transformToGuarantorView } from "../lib/helpers";

// Schema for validating ID input
const getGuarantorSchema = z.object({
  id: z.string().min(1, { message: "guarantor.validation.id.required" }),
});

type GetGuarantorInput = z.infer<typeof getGuarantorSchema>;

/**
 * Retrieves a single guarantor by ID
 *
 * @param {GetGuarantorInput} params - Object containing the guarantor ID
 * @returns {Promise<ActionResponse>} Response with guarantor data or error
 *
 * @example
 * // Success case
 * const response = await getGuarantor({ id: "123" });
 * // => { success: true, message: "guarantor.toast.fetched", data: { id: "123", ... } }
 *
 * @example
 * // Error case - not found
 * const response = await getGuarantor({ id: "non-existent-id" });
 * // => { success: false, message: "errors.notFound" }
 */
export async function getGuarantor(params: GetGuarantorInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Validate the input
    const validation = getGuarantorSchema.safeParse(params);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const { id } = validation.data;

    // Check if user has permission to read guarantors
    const ability = await getAbility(user);
    if (!ability.can("read", "Guarantor")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "guarantor" });

    // Fetch the guarantor
    const guarantor = await prisma.guarantor.findUnique({
      where: { id },
    });

    if (!guarantor) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { id: "guarantor.validation.id.notFound" },
      };
    }

    // Transform guarantor to include computed fields
    const transformedGuarantor = transformToGuarantorView(guarantor);

    return {
      success: true,
      message: t("toast.fetched"),
      data: transformedGuarantor,
    };
  } catch (error) {
    // Log the error
    console.error("Error fetching guarantor:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
