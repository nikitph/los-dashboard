"use server";

import { prisma } from "@/lib/prisma/prisma";
import { handleActionError } from "@/lib/actionErrorHelpers";

export async function updateLoanApplicationTenure(id: string, tenure: number, emi: number, proposedAmount: number) {
  try {
    const existingLoanApplication = await prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!existingLoanApplication) {
      return {
        success: false,
        message: "Loan application not found",
      };
    }

    const updatedLoanApplication = await prisma.loanApplication.update({
      where: { id },
      data: {
        selectedTenure: tenure,
        calculatedEMI: emi,
        proposedAmount: proposedAmount,
        updatedAt: new Date(),
      },
    });
    return {
      success: true,
      message: "Loan application tenure updated successfully",
      data: updatedLoanApplication,
    };
  } catch (error) {
    console.error("Error updating loan application tenure:", error);
    handleActionError(error);
  }
}
