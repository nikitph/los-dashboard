"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { transformToFullVerificationView } from "../lib/helpers";

// Schema for get verification input
const getVerificationSchema = z.object({
  id: z.string().min(1, { message: "validation.id.required" }),
});

type GetVerificationInput = z.infer<typeof getVerificationSchema>;

/**
 * Fetches a verification by ID with all related verification data
 *
 * @param {GetVerificationInput} data - The verification ID to fetch
 * @returns {Promise<ActionResponse>} Response with verification data or error details
 *
 * @example
 * // Success case
 * const response = await getVerification({ id: "verification123" });
 * // => { success: true, data: { verification: {...}, residenceVerification: {...} } }
 *
 * @example
 * // Error case - not found
 * const response = await getVerification({ id: "non-existent-id" });
 * // => { success: false, message: "errors.notFound" }
 */
export async function getVerification(data: GetVerificationInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Validate the data
    const validation = getVerificationSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    // Check if user has permission to read verifications
    const ability = await getAbility(user);
    if (!ability.can("read", "Verification")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "Verification" });

    // Fetch the verification with related data
    const verification = await prisma.verification.findUnique({
      where: { id: data.id },
      include: {
        verifiedBy: true,
        loanApplication: true,
        residenceVerification: true,
        businessVerification: true,
        propertyVerification: true,
        vehicleVerification: true,
        documents: true,
      },
    });

    if (!verification) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { id: "verification.validation.id.notFound" },
      };
    }

    // Transform the data to add derived fields
    const transformedData = transformToFullVerificationView(verification);

    return {
      success: true,
      message: t("toast.fetched"),
      data: transformedData,
    };
  } catch (error) {
    // Log the error
    console.error("Error fetching verification:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
