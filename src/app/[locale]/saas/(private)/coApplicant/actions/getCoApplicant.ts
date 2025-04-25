"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { computeDerivedFields } from "../lib/helpers";
import { CoApplicantView } from "../schemas/coApplicantSchema";

/**
 * Retrieves a single CoApplicant by ID
 *
 * @param {string} id - The CoApplicant ID to retrieve
 * @returns {Promise<ActionResponse<CoApplicantView>>} Response with CoApplicant data or error
 *
 * @example
 * // Success case
 * const response = await getCoApplicant("123abc");
 * // => { success: true, data: { id: "123abc", firstName: "Jane", ... } }
 *
 * @example
 * // Error case - not found
 * const response = await getCoApplicant("invalid-id");
 * // => { success: false, message: "errors.notFound" }
 */
export async function getCoApplicant(id: string): Promise<ActionResponse<CoApplicantView>> {
  try {
    // Get current user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check permissions
    const ability = await getAbility(user);
    if (!ability.can("read", "CoApplicant")) {
      return { success: false, message: "errors.forbidden" };
    }

    // Get the co-applicant
    const coApplicant = await prisma.coApplicant.findUnique({
      where: { id },
    });

    // Return error if not found
    if (!coApplicant) {
      const t = await getTranslations({ locale: "en", namespace: "CoApplicant" });
      return {
        success: false,
        message: t("errors.notFound"),
      };
    }

    // Compute derived fields
    const coApplicantWithDerivedFields = computeDerivedFields(coApplicant);

    // Get translations for success message
    const t = await getTranslations({ locale: "en", namespace: "CoApplicant" });

    return {
      success: true,
      message: t("toast.fetched"),
      data: coApplicantWithDerivedFields as CoApplicantView,
    };
  } catch (error) {
    console.error("Error fetching coApplicant:", error);
    return handleActionError({ type: "unexpected", error });
  }
}
