"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";

/**
 * Soft deletes an applicant by setting the deletedAt timestamp
 *
 * @param id - The ID of the applicant to delete
 * @returns A promise resolving to an ActionResponse indicating success or failure
 *
 * @example
 * // Success case
 * const response = await deleteApplicant("app123");
 * // => { success: true, message: "Applicant.toast.deleted" }
 *
 * @example
 * // Error case - not found
 * const response = await deleteApplicant("nonexistent");
 * // => { success: false, message: "errors.notFound" }
 */
export async function deleteApplicant(id: string): Promise<ActionResponse<void>> {
  try {
    // Get the current user from the session
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get the user's ability based on their role
    const ability = await getAbility(user);

    // Check if the user can delete applicants
    if (!ability.can("delete", "Applicant")) {
      return { success: false, message: "errors.forbidden" };
    }

    // First, retrieve the existing applicant to check permissions and confirm existence
    const existingApplicant = await prisma.applicant.findUnique({
      where: { id },
    });

    if (!existingApplicant) {
      return { success: false, message: "errors.notFound" };
    }

    // Bank-level permission check:
    // If the user is bank-specific, they can only delete applicants in their bank
    if (user.currentRole?.bankId && existingApplicant.bankId !== user.currentRole.bankId) {
      return { success: false, message: "errors.forbidden" };
    }

    // Check for related loan applications in process
    const activeLoans = await prisma.loanApplication.count({
      where: {
        applicantId: id,
        status: {
          notIn: ["REJECTED"],
        },
        deletedAt: null,
      },
    });

    if (activeLoans > 0) {
      return {
        success: false,
        message: "errors.cannotDelete",
        errors: {
          root: "Applicant.errors.hasActiveLoans",
        },
      };
    }

    // Perform soft delete by updating the deletedAt field
    await prisma.applicant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Return success response
    return {
      success: true,
      message: "Applicant.toast.deleted",
    };
  } catch (error) {
    // Handle database errors
    if ((error as any)?.code === "P2025") {
      return {
        success: false,
        message: "errors.notFound",
      };
    }

    // Handle other unexpected errors
    return handleActionError({ type: "unexpected", error });
  }
}
