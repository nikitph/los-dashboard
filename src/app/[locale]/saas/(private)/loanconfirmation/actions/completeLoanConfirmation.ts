"use server";

import { prisma } from "@/lib/prisma/prisma";
import { handleActionError } from "@/lib/actionErrorHelpers";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getAbility } from "@/lib/casl/getAbility";
import { ActionResponse } from "@/types/globalTypes";
import { createLoanConfirmationSchema } from "../schemas/loanConfirmationSchema";

/**
 * Completes the loan confirmation process based on the status
 *
 * @param {Object} data - The confirmation data
 * @param {string} data.loanApplicationId - The loan application ID
 * @param {string} data.status - The status (a=accepted, r=rejected, e=escalated)
 * @param {string} data.remark - Any remarks for the loan application
 * @returns {Promise<ActionResponse>} Success/error response
 */
export async function completeLoanConfirmation(data: {
  loanApplicationId: string;
  status: "a" | "r" | "e";
  remark?: string;
}): Promise<ActionResponse> {
  try {
    // Get the authenticated user
    const user = await getServerSessionUser();
    if (!user) {
      return {
        success: false,
        message: "errors.unauthorized",
      };
    }

    // Validate input data
    const validation = createLoanConfirmationSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({
        type: "validation",
        error: validation.error,
      });
    }

    // Check permissions using CASL
    const ability = await getAbility(user);
    if (!ability.can("update", "LoanApplication")) {
      return {
        success: false,
        message: "errors.unauthorized",
      };
    }

    // Find the existing loan application
    const existingLoanApplication = await prisma.loanApplication.findUnique({
      where: { id: data.loanApplicationId },
    });

    if (!existingLoanApplication) {
      return {
        success: false,
        message: "loanConfirmation.errors.notFound",
      };
    }

    // Update the loan application based on status
    let updatedLoanApplication;

    switch (data.status) {
      case "a": // Accepted - proceed to inspection
        if (!ability.can("update", "LoanApplication")) {
          return {
            success: false,
            message: "errors.unauthorized",
          };
        }

        updatedLoanApplication = await prisma.loanApplication.update({
          where: { id: data.loanApplicationId },
          data: {
            status: "PENDING_INSPECTOR_ASSIGNMENT",
            updatedAt: new Date(),
          },
        });

        // Optionally create an inspection record here
        break;

      case "r": // Rejected - finish application
        if (!ability.can("update", "LoanApplication")) {
          return {
            success: false,
            message: "errors.unauthorized",
          };
        }

        updatedLoanApplication = await prisma.loanApplication.update({
          where: { id: data.loanApplicationId },
          data: {
            status: "REJECTED_BY_APPLICANT",
            updatedAt: new Date(),
          },
        });
        break;

      case "e": // Escalated - send to loan officer
        if (!ability.can("update", "LoanApplication")) {
          return {
            success: false,
            message: "errors.unauthorized",
          };
        }

        updatedLoanApplication = await prisma.loanApplication.update({
          where: { id: data.loanApplicationId },
          data: {
            status: "PENDING_LOAN_OFFICER_REVIEW",
            updatedAt: new Date(),
          },
        });
        break;

      default:
        return {
          success: false,
          message: "loanConfirmation.errors.invalidStatus",
        };
    }

    // Return success response
    return {
      success: true,
      message: "loanConfirmation.toast.completed",
      data: updatedLoanApplication,
    };
  } catch (error) {
    console.error("Error completing loan confirmation:", error);
    return handleActionError(error);
  }
}
