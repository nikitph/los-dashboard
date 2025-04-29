"use server";

import { prisma } from "@/lib/prisma/prisma";
import { getServerSessionUser } from "@/lib/getServerUser";
import { ActionResponse } from "@/types/globalTypes";
import { defineAbilityFor } from "@/lib/casl/ability";
import { defineIncomeFieldVisibility } from "../lib/defineIncomeFieldVisibility";

/**
 * Retrieves a single income record with its associated income details
 * @param id - The ID of the income record to retrieve
 * @returns ActionResponse with success/error status and data
 */
export async function getIncome(id: string): Promise<ActionResponse> {
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
    const fieldVisibility = defineIncomeFieldVisibility(ability);

    // Check if user has permission to read income
    if (!ability.can("read", "Income")) {
      return {
        success: false,
        message: "You don't have permission to view this income record",
      };
    }

    // Retrieve income with its details
    const income = await prisma.income.findUnique({
      where: { id },
      include: {
        incomeDetails: true,
        applicant: {
          select: {
            id: true,
            user: true,
          },
        },
      },
    });

    if (!income) {
      return {
        success: false,
        message: "Income record not found",
      };
    }

    // Filter fields based on permissions
    const filteredIncome = Object.keys(income).reduce((acc, key) => {
      if (key === "incomeDetails") {
        // Handle nested incomeDetails separately
        if (fieldVisibility.incomeDetails) {
          acc[key] = income.incomeDetails;
        }
      } else if (key === "applicant") {
        // Always include the applicant reference
        acc[key] = income.applicant;
      } else if (fieldVisibility[key as keyof typeof fieldVisibility]) {
        // Include fields the user has permission to see
        acc[key] = income[key as keyof typeof income];
      }
      return acc;
    }, {} as any);

    return {
      success: true,
      message: "Income information retrieved successfully",
      data: filteredIncome,
    };
  } catch (error) {
    console.error("Error retrieving income data:", error);

    return {
      success: false,
      message: "Failed to retrieve income information",
      errors: {
        server: "An unexpected error occurred",
      },
    };
  }
}
