"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { transformToVerificationView } from "../lib/helpers";
import { VerificationStatus, VerificationType } from "../../verifications/schemas/verificationSchema";

// Schema for query parameters
const getVerificationsSchema = z.object({
  loanApplicationId: z.string().optional(),
  type: VerificationType.optional(),
  status: VerificationStatus.optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  verifiedById: z.string().optional(),
  result: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["verificationDate", "createdAt", "updatedAt", "type", "status"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

type GetVerificationsInput = z.infer<typeof getVerificationsSchema>;

/**
 * Fetches verifications based on filter criteria with pagination
 *
 * @param {GetVerificationsInput} params - Filter and pagination parameters
 * @returns {Promise<ActionResponse>} Response with verifications data or error
 *
 * @example
 * // Get all verifications with pagination
 * const response = await getVerifications({ page: 1, limit: 10 });
 * // => { success: true, data: [...], meta: { page: 1, limit: 10, totalCount: 50 } }
 *
 * @example
 * // Get verifications with filtering
 * const response = await getVerifications({
 *   type: "RESIDENCE",
 *   status: "COMPLETED",
 *   page: 1,
 *   limit: 10
 * });
 * // => { success: true, data: [...], meta: { page: 1, limit: 10, totalCount: 5 } }
 */
export async function getVerifications(
  params: Partial<GetVerificationsInput> = { page: 1, limit: 10 },
): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check if user has permission to read verifications
    const ability = await getAbility(user);
    if (!ability.can("read", "Verification")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "Verification" });

    // Validate and parse input params
    const validation = getVerificationsSchema.safeParse(params);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const {
      loanApplicationId,
      type,
      status,
      fromDate,
      toDate,
      verifiedById,
      result,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    } = validation.data;

    // Build the query filter
    const filter: any = {
      // Only show non-deleted records by default
      deletedAt: null,
    };

    // Apply filters if provided
    if (loanApplicationId) {
      filter.loanApplicationId = loanApplicationId;
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (fromDate || toDate) {
      filter.verificationDate = {};

      if (fromDate) {
        filter.verificationDate.gte = fromDate;
      }

      if (toDate) {
        // Set to end of day for to date
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.verificationDate.lte = endDate;
      }
    }

    if (verifiedById) {
      filter.verifiedById = verifiedById;
    }

    if (result !== undefined) {
      filter.result = result;
    }

    // Add search filter if provided
    if (search) {
      filter.OR = [
        // Search in related tables based on relationships
        {
          residenceVerification: {
            OR: [
              { ownerFirstName: { contains: search, mode: "insensitive" } },
              { ownerLastName: { contains: search, mode: "insensitive" } },
              { addressCity: { contains: search, mode: "insensitive" } },
              { addressState: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          businessVerification: {
            OR: [
              { businessName: { contains: search, mode: "insensitive" } },
              { businessType: { contains: search, mode: "insensitive" } },
              { addressCity: { contains: search, mode: "insensitive" } },
              { addressState: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          propertyVerification: {
            OR: [
              { ownerFirstName: { contains: search, mode: "insensitive" } },
              { ownerLastName: { contains: search, mode: "insensitive" } },
              { addressCity: { contains: search, mode: "insensitive" } },
              { addressState: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          vehicleVerification: {
            OR: [
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
              { registrationNumber: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        // Also search in remarks field
        { remarks: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.verification.count({ where: filter });

    // Determine sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch verifications with pagination and sorting
    const verifications = await prisma.verification.findMany({
      where: filter,
      include: {
        verifiedBy: true,
        loanApplication: true,
        residenceVerification: true,
        businessVerification: true,
        propertyVerification: true,
        vehicleVerification: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    });

    // Transform verifications to add computed fields
    const transformedVerifications = verifications.map(transformToVerificationView);

    return {
      success: true,
      message: t("toast.fetched"),
      data: transformedVerifications,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    // Log the error
    console.error("Error fetching verifications:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
