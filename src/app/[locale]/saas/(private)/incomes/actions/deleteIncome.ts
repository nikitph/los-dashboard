"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import { getServerSessionUser } from "@/lib/getServerUser";
import { ActionResponse } from "@/types/globalTypes";
import { defineAbilityFor } from "@/lib/casl/ability";

/**
 * Deletes an income record and its associated income details
 * @param id - The ID of the income record to delete
 * @returns ActionResponse with success/error status
 */
export async function deleteIncome(id: string): Promise<ActionResponse> {
  try {
    // Check user authorization
    const user = await getServerSessionUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    }

    // Get user's ability for permission checking
    const ability = defineAbilityFor(user);

    // Check if user has permission to delete income
    if (!ability.can("delete", "Income")) {
      return {
        success: false,
        message: "You don't have permission to delete this income record",
      };
    }

    // Get the income record to retrieve the applicantId for path revalidation
    const income = await prisma.income.findUnique({
      where: { id },
      select: { applicantId: true },
    });

    if (!income) {
      return {
        success: false,
        message: "Income record not found",
      };
    }

    // Use a transaction to delete the income and its details
    await prisma.$transaction(async (tx) => {
      // Delete associated income details first
      await tx.incomeDetail.deleteMany({
        where: { incomeId: id },
      });

      // Delete the income record
      await tx.income.delete({
        where: { id },
      });
    });

    // Revalidate paths to update UI
    revalidatePath("/saas/(private)/incomes");
    revalidatePath(`/saas/(private)/applicant/${income.applicantId}`);

    return {
      success: true,
      message: "Income record deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting income data:", error);

    return {
      success: false,
      message: "Failed to delete income record",
      errors: {
        server: "An unexpected error occurred",
      },
    };
  }
}
