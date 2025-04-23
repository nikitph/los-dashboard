"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { computeDerivedFields } from "../lib/helpers";
import { CoApplicantView } from "../schemas/coApplicantSchema";

/**
 * List interface for CoApplicant filtering options
 */
interface ListCoApplicantsOptions {
  search?: string;
  loanApplicationId?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Retrieves a list of CoApplicants with optional filtering
 *
 * @param {ListCoApplicantsOptions} options - Optional filtering and pagination options
 * @returns {Promise<ActionResponse<{data: CoApplicantView[], total: number, page: number, pageSize: number}>>} Response with paginated CoApplicants data or error
 *
 * @example
 * // Success case - all co-applicants
 * const response = await getCoApplicants({});
 * // => { success: true, data: { data: [...], total: 42, page: 1, pageSize: 10 } }
 *
 * @example
 * // Success case - filtered by loanApplicationId
 * const response = await getCoApplicants({ loanApplicationId: "loan123" });
 * // => { success: true, data: { data: [...], total: 2, page: 1, pageSize: 10 } }
 */
export async function getCoApplicants(options: ListCoApplicantsOptions = {}): Promise<
  ActionResponse<{
    data: CoApplicantView[];
    total: number;
    page: number;
    pageSize: number;
  }>
> {
  try {
    // Get current user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check permissions
    const ability = await getAbility(user);
    if (!ability.can("read", "CoApplicant")) {
      return { success: false, message: "errors.forbidden" };
    }

    // Setup pagination
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // Prepare where clause
    const where: any = {
      deletedAt: null,
    };

    // Add loan application filter if provided
    if (options.loanApplicationId) {
      where.loanApplicationId = options.loanApplicationId;
    }

    // Add search filter if provided
    if (options.search) {
      const search = options.search.trim();
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.coApplicant.count({ where });

    // Get paginated results
    const coApplicants = await prisma.coApplicant.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Compute derived fields for each co-applicant
    const coApplicantsWithDerivedFields = coApplicants.map(computeDerivedFields);

    // Get translations for success message
    const t = await getTranslations({ locale: "en", namespace: "CoApplicant" });

    return {
      success: true,
      message: t("toast.listed"),
      data: {
        data: coApplicantsWithDerivedFields as CoApplicantView[],
        total,
        page,
        pageSize,
      },
    };
  } catch (error) {
    console.error("Error fetching coApplicants:", error);
    return handleActionError({ type: "unexpected", error });
  }
}
