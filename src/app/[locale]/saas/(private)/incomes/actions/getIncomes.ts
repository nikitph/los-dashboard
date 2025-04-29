"use server";

import { prisma } from "@/lib/prisma/prisma";
import { getServerSessionUser } from "@/lib/getServerUser";
import { ActionResponse } from "@/types/globalTypes";
import { defineAbilityFor } from "@/lib/casl/ability";
import { defineIncomeFieldVisibility } from "../lib/defineIncomeFieldVisibility";

/**
 * Retrieves a list of income records with optional filtering by applicant
 * @param params - Query parameters for filtering and pagination
 * @returns ActionResponse with success/error status and data
 */
export async function getIncomes(params?: {
  applicantId?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResponse> {
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
        message: "You don't have permission to view income records",
      };
    }

    // Set up pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    // Build query filters
    const where = params?.applicantId ? { applicantId: params.applicantId } : {};

    // Get total count for pagination
    const totalCount = await prisma.income.count({ where });

    // Retrieve incomes with pagination
    const incomes = await prisma.income.findMany({
      where,
      include: {
        incomeDetails: true,
        applicant: {
          select: {
            id: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    });

    // Filter fields based on permissions
    const filteredIncomes = incomes.map((income) => {
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

      return filteredIncome;
    });

    return {
      success: true,
      message: "Success",
      data: {
        incomes: filteredIncomes,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
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
