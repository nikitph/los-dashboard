"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

// Schema for delete verification input
const deleteVerificationSchema = z.object({
  id: z.string().min(1, { message: "validation.id.required" }),
});

type DeleteVerificationInput = z.infer<typeof deleteVerificationSchema>;

/**
 * Soft-deletes a verification by setting the deletedAt timestamp
 *
 * @param {DeleteVerificationInput} data - The verification ID to delete
 * @returns {Promise<ActionResponse>} Response with result or error details
 *
 * @example
 * // Success case
 * const response = await deleteVerification({ id: "verification123" });
 * // => { success: true, message: "verification.toast.deleted" }
 *
 * @example
 * // Error case - not found
 * const response = await deleteVerification({ id: "non-existent-id" });
 * // => { success: false, message: "errors.notFound" }
 */
export async function deleteVerification(data: DeleteVerificationInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Validate the data
    const validation = deleteVerificationSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    // Check if the verification exists
    const existingVerification = await prisma.verification.findUnique({
      where: { id: data.id },
      include: { loanApplication: true },
    });

    if (!existingVerification) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { id: "verification.validation.id.notFound" },
      };
    }

    // Check if user has permission to delete this verification
    const ability = await getAbility(user);
    if (!ability.can("delete", "Verification")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "Verification" });

    // Soft-delete the verification (set deletedAt timestamp)
    await prisma.verification.update({
      where: { id: data.id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Update loan application status if needed
    // Only update if it's related to this verification status
    const loanApplication = existingVerification.loanApplication;
    if (loanApplication && 
        (loanApplication.status === "VERIFICATION_IN_PROGRESS" ||
         loanApplication.status === "VERIFICATION_COMPLETED" ||
         loanApplication.status === "VERIFICATION_FAILED")) {
      
      // Check if there are other active verifications
      const otherVerifications = await prisma.verification.count({
        where: {
          loanApplicationId: loanApplication.id,
          id: { not: data.id },
          deletedAt: null,
        },
      });
      
      // If no other verifications, update loan application status
      if (otherVerifications === 0) {
        await prisma.loanApplication.update({
          where: { id: loanApplication.id },
          data: {
            status: "PENDING_VERIFICATION", // Reset to pending verification
          },
        });
      }
    }

    return {
      success: true,
      message: t("toast.deleted"),
    };
  } catch (error) {
    // Log the error
    console.error("Error deleting verification:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
} 