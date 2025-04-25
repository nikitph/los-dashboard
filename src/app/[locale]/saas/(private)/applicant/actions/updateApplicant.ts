"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { formatApplicantForDisplay } from "../lib/helpers";
import { ApplicantView, UpdateApplicantInput, updateApplicantSchema } from "../schemas/applicantSchema";

/**
 * Updates an existing applicant
 *
 * @param data - The applicant data to update, including ID
 * @returns A promise resolving to an ActionResponse containing the updated applicant or an error
 *
 * @example
 * // Success case
 * const response = await updateApplicant({
 *   id: "app123",
 *   addressCity: "Bangalore",
 *   addressState: "Karnataka",
 * });
 * // => { success: true, message: "Applicant.toast.updated", data: { id: "app123", ... } }
 *
 * @example
 * // Error case - not found
 * const response = await updateApplicant({ id: "nonexistent" });
 * // => { success: false, message: "errors.notFound" }
 */
export async function updateApplicant(rawData: UpdateApplicantInput): Promise<ActionResponse<ApplicantView>> {
  try {
    // Get the current user from the session
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Ensure the ID is provided
    if (!rawData.id) {
      return {
        success: false,
        message: "errors.validation",
        errors: { id: "validation.id.required" },
      };
    }

    // Get the user's ability based on their role
    const ability = await getAbility(user);

    // First, retrieve the existing applicant to check permissions
    const existingApplicant = await prisma.applicant.findUnique({
      where: { id: rawData.id },
    });

    if (!existingApplicant) {
      return { success: false, message: "errors.notFound" };
    }

    // Check if the user can update this applicant
    if (!ability.can("update", "Applicant")) {
      return { success: false, message: "errors.forbidden" };
    }

    // Bank-level permission check:
    // If the user is bank-specific, they can only update applicants in their bank
    if (user.currentRole?.bankId && existingApplicant.bankId !== user.currentRole.bankId) {
      return { success: false, message: "errors.forbidden" };
    }

    // Validate the input data
    const validation = updateApplicantSchema.safeParse(rawData);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const validatedData = validation.data;

    // Remove id from the data to be updated (it's in the where clause)
    const { id, ...dataToUpdate } = validatedData;

    // Field-level permission checks - only update fields the user can update
    const permittedUpdates: any = {};

    // Dynamically check each field against the user's ability
    for (const [key, value] of Object.entries(dataToUpdate)) {
      if (ability.can("update", "Applicant", key as keyof typeof dataToUpdate)) {
        permittedUpdates[key] = value;
      }
    }

    // Update the applicant with permitted fields only
    const updatedApplicant = await prisma.applicant.update({
      where: { id },
      data: permittedUpdates,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        bank: {
          select: {
            name: true,
          },
        },
      },
    });

    // Format the applicant for display
    const formattedApplicant = formatApplicantForDisplay({
      ...updatedApplicant,
      fullName: updatedApplicant.user
        ? `${updatedApplicant.user.firstName || ""} ${updatedApplicant.user.lastName || ""}`.trim()
        : undefined,
    });

    // Return a success response with the formatted applicant data
    return {
      success: true,
      message: "Applicant.toast.updated",
      data: formattedApplicant,
    };
  } catch (error: any) {
    // Handle specific database errors
    if (error?.code === "P2025") {
      // P2025 is Prisma's "record not found" error
      return {
        success: false,
        message: "errors.notFound",
      };
    }

    // Handle other unexpected errors
    return handleActionError({ type: "unexpected", error });
  }
}
