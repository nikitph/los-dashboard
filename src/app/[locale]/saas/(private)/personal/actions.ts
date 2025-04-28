"use server";

import { prisma } from "@/lib/prisma/prisma";
import { revalidatePath } from "next/cache";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getAbility } from "@/lib/casl/getAbility";
import { handleActionError } from "@/lib/actionErrorHelpers";
import { ActionResponse } from "@/types/globalTypes";
import {
  PersonalInformationFormValues,
  PersonalInformationSchema
} from "@/app/[locale]/saas/(private)/personal/schema";

/**
 * Updates an existing applicant's personal information
 *
 * @param {string} id - The ID of the applicant to update
 * @param {PersonalInformationFormValues} data - The validated applicant data
 * @returns {Promise<ActionResponse>} Response with updated applicant or error details
 *
 * @example
 * // Success case
 * const response = await updateApplicant("123e4567-e89b-12d3-a456-426614174000", validApplicantData);
 * // => { success: true, message: "Applicant.toast.updated", data: { id: "123e4567-e89b-12d3-a456-426614174000", ... } }
 *
 * @example
 * // Error case - validation failure
 * const response = await updateApplicant("123e4567-e89b-12d3-a456-426614174000", invalidApplicantData);
 * // => { success: false, message: "errors.validationFailed", errors: { aadharNumber: "validation.aadharNumber.format" } }
 */

export async function updateApplicant(id: string, data: PersonalInformationFormValues): Promise<ActionResponse> {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user permissions
    const ability = await getAbility(user);
    if (!ability.can("update", "Applicant")) {
      return { success: false, message: "errors.permissionDenied" };
    }

    const validation = PersonalInformationSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError(validation.error);
    }

    const {
      dateOfBirth,
      addressState,
      addressCity,
      addressFull,
      addressPinCode,
      aadharNumber,
      panNumber,
      aadharVerificationStatus,
      panVerificationStatus,
    } = validation.data;

    const existingApplicant = await prisma.applicant.findUnique({
      where: { id },
    });

    if (!existingApplicant) {
      return {
        success: false,
        message: "errors.notFound",
      };
    }

    const updatedApplicant = await prisma.applicant.update({
      where: { id },
      data: {
        dateOfBirth,
        addressState,
        addressCity,
        addressFull,
        addressPinCode,
        aadharNumber,
        panNumber,
        aadharVerificationStatus,
        panVerificationStatus,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/applicants/list");
    revalidatePath(`/saas/applicants/${id}`);
    revalidatePath(`/saas/applicants/${id}/view`);
    revalidatePath(`/saas/applicants/${id}/edit`);

    return {
      success: true,
      message: "Applicant.toast.updated",
      data: updatedApplicant,
    };
  } catch (error) {
    return handleActionError(error);
  }
}
