"use server";

import { prisma } from "@/lib/prisma/prisma";
import { handleActionError } from "@/lib/actionErrorHelpers";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getAbility } from "@/lib/casl/getAbility";
import { ActionResponse } from "@/types/globalTypes";
import { updateLoanEligibilitySchema } from "../schemas/loanEligibilitySchema";

/**
 * Updates a loan application with the selected tenure, EMI, and proposed amount
 *
 * @param {string} id - The loan application ID
 * @param {number} tenure - The selected tenure in months
 * @param {number} emi - The calculated EMI amount
 * @param {number} proposedAmount - The proposed loan amount
 * @returns {Promise<ActionResponse>} Success/error response
 */
export async function updateLoanApplicationTenure(
  id: string,
  tenure: number,
  emi: number,
  proposedAmount: number,
): Promise<ActionResponse> {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return {
        success: false,
        message: "errors.unauthorized",
      };
    }

    // Check permissions using CASL
    const ability = await getAbility(user);
    if (!ability.can("update", "LoanApplication")) {
      return {
        success: false,
        message: "errors.unauthorized",
      };
    }

    // Validate input with Zod schema
    const validatedData = updateLoanEligibilitySchema.parse({
      loanApplicationId: id,
      selectedTenure: tenure,
      calculatedEMI: emi,
      proposedAmount: proposedAmount,
    });

    // Find the existing loan application
    const existingLoanApplication = await prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!existingLoanApplication) {
      return {
        success: false,
        message: "errors.notFound",
      };
    }

    // Update the loan application with validated data
    const updatedLoanApplication = await prisma.loanApplication.update({
      where: { id },
      data: {
        selectedTenure: validatedData.selectedTenure,
        calculatedEMI: validatedData.calculatedEMI,
        proposedAmount: validatedData.proposedAmount,
        updatedAt: new Date(),
      },
    });

    // Return success response
    return {
      success: true,
      message: "toast.updated",
      data: updatedLoanApplication,
    };
  } catch (error) {
    console.error("Error updating loan application tenure:", error);
    return handleActionError(error);
  }
}
