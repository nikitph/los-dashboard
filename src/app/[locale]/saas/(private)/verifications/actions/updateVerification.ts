"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import {
  UpdateFullVerificationInput,
  updateFullVerificationSchema
} from "../../verifications/schemas/verificationSchema";

/**
 * Updates an existing verification in the database with related type-specific verification data
 *
 * @param {UpdateFullVerificationInput} data - The verification data to update
 * @returns {Promise<ActionResponse>} Response with updated verification or error details
 *
 * @example
 * // Success case
 * const response = await updateVerification({
 *   verification: {
 *     id: "verification123",
 *     status: "COMPLETED",
 *     result: true,
 *     remarks: "Verification completed successfully",
 *   },
 *   residenceVerification: {
 *     id: "residence123",
 *     verificationId: "verification123",
 *     // ... other updated fields
 *   }
 * });
 * // => { success: true, message: "verification.toast.updated", data: { id: "123", ... } }
 */
export async function updateVerification(data: UpdateFullVerificationInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Validate the data
    const validation = updateFullVerificationSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    // Check if the verification exists
    if (!data.verification.id) {
      return {
        success: false,
        message: "errors.validationFailed",
        errors: { "verification.id": "verification.validation.id.required" },
      };
    }

    const existingVerification = await prisma.verification.findUnique({
      where: { id: data.verification.id },
      include: {
        residenceVerification: true,
        businessVerification: true,
        propertyVerification: true,
        vehicleVerification: true,
        loanApplication: true,
      },
    });

    if (!existingVerification) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { "verification.id": "verification.validation.id.notFound" },
      };
    }

    // Check if user has permission to update this verification
    const ability = await getAbility(user);
    if (!ability.can("update", "Verification")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "Verification" });

    // Extract id and prepare data for update
    const { id, ...verificationUpdateData } = data.verification;

    // Update in a transaction to ensure consistency across related tables
    const result = await prisma.$transaction(async (tx) => {
      // Update the base verification
      const updatedVerification = await tx.verification.update({
        where: { id },
        data: {
          ...verificationUpdateData,
          // If status is changing to COMPLETED or FAILED, update the verification date
          ...(verificationUpdateData.status === "COMPLETED" || verificationUpdateData.status === "FAILED"
            ? { verificationDate: new Date() }
            : {}),
        },
      });

      // Update the type-specific verification data if provided
      if (data.residenceVerification && existingVerification.residenceVerification) {
        const { id: residenceId, verificationId, ...residenceUpdateData } = data.residenceVerification;

        if (residenceId) {
          await tx.residenceVerification.update({
            where: { id: residenceId },
            data: residenceUpdateData,
          });
        }
      }

      if (data.businessVerification && existingVerification.businessVerification) {
        const { id: businessId, verificationId, ...businessUpdateData } = data.businessVerification;

        if (businessId) {
          await tx.businessVerification.update({
            where: { id: businessId },
            data: businessUpdateData,
          });
        }
      }

      if (data.propertyVerification && existingVerification.propertyVerification) {
        const { id: propertyId, verificationId, ...propertyUpdateData } = data.propertyVerification;

        if (propertyId) {
          await tx.propertyVerification.update({
            where: { id: propertyId },
            data: propertyUpdateData,
          });
        }
      }

      if (data.vehicleVerification && existingVerification.vehicleVerification) {
        const { id: vehicleId, verificationId, ...vehicleUpdateData } = data.vehicleVerification;

        if (vehicleId) {
          await tx.vehicleVerification.update({
            where: { id: vehicleId },
            data: vehicleUpdateData,
          });
        }
      }

      // Update loan application status if verification status has changed
      if (
        verificationUpdateData.status &&
        verificationUpdateData.status !== existingVerification.status &&
        existingVerification.loanApplication
      ) {
        const newLoanStatus =
          verificationUpdateData.status === "COMPLETED"
            ? "VERIFICATION_COMPLETED"
            : verificationUpdateData.status === "FAILED"
              ? "VERIFICATION_FAILED"
              : existingVerification.loanApplication.status;

        if (newLoanStatus !== existingVerification.loanApplication.status) {
          await tx.loanApplication.update({
            where: { id: existingVerification.loanApplicationId },
            data: {
              status: newLoanStatus,
            },
          });
        }
      }

      return updatedVerification;
    });

    return {
      success: true,
      message: t("toast.updated"),
      data: result,
    };
  } catch (error) {
    // Log the error
    console.error("Error updating verification:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
