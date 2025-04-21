"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { transformToGuarantorView } from "../lib/helpers";

// Schema for query parameters
const getGuarantorsSchema = z.object({
  loanApplicationId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

type GetGuarantorsInput = z.infer<typeof getGuarantorsSchema>;

/**
 * Fetches guarantors based on filter criteria
 *
 * @param {GetGuarantorsInput} params - Filter and pagination parameters
 * @returns {Promise<ActionResponse>} Response with guarantors data or error
 *
 * @example
 * // Get all guarantors with pagination
 * const response = await getGuarantors({ page: 1, limit: 10 });
 * // => { success: true, data: [...], meta: { page: 1, limit: 10, totalCount: 50 } }
 *
 * @example
 * // Get guarantors for a specific loan application
 * const response = await getGuarantors({ loanApplicationId: "loan123" });
 * // => { success: true, data: [...], meta: { page: 1, limit: 10, totalCount: 3 } }
 */
export async function getGuarantors(
  params: Partial<GetGuarantorsInput> = { page: 1, limit: 10 },
): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check if user has permission to read guarantors
    const ability = await getAbility(user);
    if (!ability.can("read", "Guarantor")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "guarantor" });

    // Validate and parse input params
    const validation = getGuarantorsSchema.safeParse(params);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const { loanApplicationId, page, limit, search } = validation.data;

    // Build the query filter
    const filter: any = {
      // Only show non-deleted records by default
      deletedAt: null,
    };

    // Filter by loan application if provided
    if (loanApplicationId) {
      filter.loanApplicationId = loanApplicationId;
    }

    // Add search filter if provided
    if (search) {
      filter.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { addressCity: { contains: search, mode: "insensitive" } },
        { addressState: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.guarantor.count({ where: filter });

    // Fetch guarantors with pagination
    const guarantors = await prisma.guarantor.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Transform guarantors to add computed fields
    const transformedGuarantors = guarantors.map(transformToGuarantorView);

    return {
      success: true,
      message: t("toast.fetched"),
      data: transformedGuarantors,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    // Log the error
    console.error("Error fetching guarantors:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
