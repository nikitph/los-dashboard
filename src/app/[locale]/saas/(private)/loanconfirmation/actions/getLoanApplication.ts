"use server";

import { prisma } from "@/lib/prisma/prisma";
import { handleActionError } from "@/lib/actionErrorHelpers";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getAbility } from "@/lib/casl/getAbility";
import { ActionResponse } from "@/types/globalTypes";
import { LoanApplication } from "@prisma/client";

/**
 * Retrieves a single loan application by ID
 *
 * @param {string} id - The loan application ID
 * @returns {Promise<ActionResponse<LoanApplication>>} Success/error response with loan application data
 */
export async function getLoanApplication(id: string): Promise<ActionResponse<LoanApplication>> {
  try {
    // Get the authenticated user
    const user = await getServerSessionUser();
    if (!user) {
      return {
        success: false,
        message: "errors.unauthorized",
      };
    }

    // Check permissions using CASL
    const ability = await getAbility(user);
    if (!ability.can("read", "LoanApplication")) {
      return {
        success: false,
        message: "errors.unauthorized",
      };
    }

    // Find the loan application
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!loanApplication) {
      return {
        success: false,
        message: "loanConfirmation.errors.notFound",
      };
    }

    // Return success response
    return {
      success: true,
      message: "loanApplication.toast.fetched",
      data: loanApplication,
    };
  } catch (error) {
    console.error("Error fetching loan application:", error);
    return handleActionError(error);
  }
}
