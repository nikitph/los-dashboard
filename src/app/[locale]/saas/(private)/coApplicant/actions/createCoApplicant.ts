"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { CreateCoApplicantInput, createCoApplicantSchema } from "../schemas/coApplicantSchema";

/**
 * Creates a new CoApplicant in the database
 *
 * @param {CreateCoApplicantInput} data - The validated co-applicant data
 * @returns {Promise<ActionResponse<any>>} Response with created co-applicant or error
 *
 * @example
 * // Success case
 * const response = await createCoApplicant({
 *   firstName: "Jane",
 *   lastName: "Doe",
 *   email: "jane@example.com",
 *   // ... other required fields
 * });
 * // => { success: true, message: "CoApplicant.toast.created", data: { id: "clq...", ... } }
 *
 * @example
 * // Error case - validation failure
 * const response = await createCoApplicant({
 *   firstName: "",
 *   lastName: "Doe",
 *   // ... missing or invalid fields
 * });
 * // => { success: false, message: "errors.validationFailed", errors: { firstName: "validation.firstName.required" } }
 */
export async function createCoApplicant(data: CreateCoApplicantInput): Promise<ActionResponse<any>> {
  try {
    // Get current user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check permissions
    const ability = await getAbility(user);
    if (!ability.can("create", "CoApplicant")) {
      return { success: false, message: "errors.forbidden" };
    }

    // Validate input data
    const validation = createCoApplicantSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const validatedData = validation.data;

    // Create coApplicant
    const coApplicant = await prisma.coApplicant.create({
      data: validatedData,
    });

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "CoApplicant" });

    return {
      success: true,
      message: t("toast.created"),
      data: coApplicant,
    };
  } catch (error) {
    console.error("Error creating coApplicant:", error);
    return handleActionError({ type: "unexpected", error });
  }
}
