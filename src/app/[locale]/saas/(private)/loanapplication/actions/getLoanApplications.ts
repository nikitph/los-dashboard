"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { enhanceLoanApplication } from "../lib/helpers";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";

type GetLoanApplicationsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  loanType?: string;
  bankId?: string;
};

/**
 * Retrieves a paginated list of loan applications from the database
 * with filtering options
 *
 * @param {GetLoanApplicationsParams} params - Search and pagination parameters
 * @returns {Promise<ActionResponse<{ items: LoanApplicationView[], total: number }>>} Response with paginated loan applications
 * @throws Will throw an error if user lacks permission to read loan applications
 */
export async function getLoanApplications(
  params: GetLoanApplicationsParams = {},
): Promise<ActionResponse<{ items: LoanApplicationView[]; total: number }>> {
  try {
    // Get authenticated user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user permissions
    const ability = await getAbility(user);
    if (!ability.can("read", "LoanApplication")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Extract and set default values for pagination
    const { page = 1, limit = 10, search = "", status, loanType, bankId } = params;

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      deletedAt: null,
    };

    // Add bankId filter if user has a current bank role
    if (user.currentRole?.bankId) {
      where.bankId = user.currentRole.bankId;
    }

    // Override bankId filter if explicitly provided and user can access multiple banks
    if (bankId && ability.can("read", "Bank")) {
      where.bankId = bankId;
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add loan type filter if provided
    if (loanType) {
      where.loanType = loanType;
    }

    // Add search filter if provided (search applicant name)
    if (search) {
      where.OR = [
        {
          applicant: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "LoanApplication" });

    // Count total matching records
    const total = await prisma.loanApplication.count({ where });

    // Retrieve the loan applications
    const loanApplications = await prisma.loanApplication.findMany({
      where,
      include: {
        applicant: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data with derived fields
    const enhancedLoanApplications = loanApplications.map((app) => enhanceLoanApplication(app));

    return {
      success: true,
      message: t("toast.fetched"),
      data: {
        items: enhancedLoanApplications,
        total,
      },
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return handleActionError({ type: "unexpected", error });
  }
}
