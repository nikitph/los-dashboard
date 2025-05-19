"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import {
  CreateFullVerificationInput,
  createFullVerificationSchema
} from "../../verifications/schemas/verificationSchema";
import { logTimelineEvent } from "@/lib/logTimelineEvents";

/**
 * Creates a new verification in the database with related type-specific verification data
 *
 * @param {CreateFullVerificationInput} data - The verification data
 * @returns {Promise<ActionResponse>} Response with created verification or error details
 *
 * @example
 * // Success case for residence verification
 * const response = await createVerification({
 *   verification: {
 *     loanApplicationId: "loan123",
 *     type: "RESIDENCE",
 *     verificationTime: "14:30",
 *   },
 *   residenceVerification: {
 *     ownerFirstName: "John",
 *     ownerLastName: "Doe",
 *     residenceType: "OWNED",
 *     structureType: "APARTMENT",
 *     // ... other fields
 *   }
 * });
 * // => { success: true, message: "verification.toast.created", data: { id: "123", ... } }
 */
export async function createVerification(data: CreateFullVerificationInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check if user has permission to create verifications
    const ability = await getAbility(user);
    if (!ability.can("create", "Verification")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "Verification" });

    // Validate the data
    const validation = createFullVerificationSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    // Check if the loan application exists and user has access to it
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id: data.verification.loanApplicationId },
    });

    if (!loanApplication) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { loanApplicationId: "verification.validation.loanApplicationId.notFound" },
      };
    }

    // Check if user has permission to access this loan application
    if (!ability.can("read", "LoanApplication")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Create the verification with a transaction to ensure all related data is created atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create the base verification
      const verification = await tx.verification.create({
        data: {
          ...data.verification,
          verifiedById: user.id, // Set the current user as the verifier
        },
      });

      // Create the type-specific verification based on the verification type
      switch (data.verification.type) {
        case "RESIDENCE":
          if (!data.residenceVerification) {
            throw new Error("Residence verification data required for RESIDENCE type");
          }

          await tx.residenceVerification.create({
            data: {
              ...data.residenceVerification,
              verificationId: verification.id,
            },
          });

          await logTimelineEvent({
            timelineEntityType: "VERIFICATION",
            timelineEntityId: result.id,
            timelineEventType: "VERIFICATION_STARTED",
            userId: user.id,
            userName: user.firstName + " " + user.lastName,
            role: user.currentRole.role,
            remarks: data.verification.remarks,
            actionData: {},
            loanApplicationId: data.verification.loanApplicationId,
            verificationId: verification.id,
          });
          break;

        case "BUSINESS":
          if (!data.businessVerification) {
            throw new Error("Business verification data required for BUSINESS type");
          }

          await tx.businessVerification.create({
            data: {
              ...data.businessVerification,
              verificationId: verification.id,
            },
          });

          await logTimelineEvent({
            timelineEntityType: "VERIFICATION",
            timelineEntityId: result.id,
            timelineEventType: "VERIFICATION_CREATED",
            userId: user.id,
            userName: user.firstName + " " + user.lastName,
            role: user.currentRole.role,
            remarks: data.verification.remarks,
            actionData: {},
            loanApplicationId: data.verification.loanApplicationId,
            verificationId: verification.id,
          });
          break;

        case "PROPERTY":
          if (!data.propertyVerification) {
            throw new Error("Property verification data required for PROPERTY type");
          }

          await tx.propertyVerification.create({
            data: {
              ...data.propertyVerification,
              verificationId: verification.id,
            },
          });
          await logTimelineEvent({
            timelineEntityType: "VERIFICATION",
            timelineEntityId: result.id,
            timelineEventType: "VERIFICATION_CREATED",
            userId: user.id,
            userName: user.firstName + " " + user.lastName,
            role: user.currentRole.role,
            remarks: data.verification.remarks,
            actionData: {},
            loanApplicationId: data.verification.loanApplicationId,
            verificationId: verification.id,
          });
          break;

        case "VEHICLE":
          if (!data.vehicleVerification) {
            throw new Error("Vehicle verification data required for VEHICLE type");
          }

          await tx.vehicleVerification.create({
            data: {
              ...data.vehicleVerification,
              verificationId: verification.id,
            },
          });
          await logTimelineEvent({
            timelineEntityType: "VERIFICATION",
            timelineEntityId: result.id,
            timelineEventType: "VERIFICATION_CREATED",
            userId: user.id,
            userName: user.firstName + " " + user.lastName,
            role: user.currentRole.role,
            remarks: data.verification.remarks,
            actionData: {},
            loanApplicationId: data.verification.loanApplicationId,
            verificationId: verification.id,
          });
          break;

        default:
          throw new Error(`Unsupported verification type: ${data.verification.type}`);
      }

      // Update loan application status if needed
      await tx.loanApplication.update({
        where: { id: data.verification.loanApplicationId },
        data: {
          status: "VERIFICATION_IN_PROGRESS",
        },
      });

      return verification;
    });

    return {
      success: true,
      message: t("toast.created"),
      data: result,
    };
  } catch (error) {
    // Log the error
    console.error("Error creating verification:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
