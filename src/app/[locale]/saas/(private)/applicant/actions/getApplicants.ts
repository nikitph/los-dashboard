"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { formatApplicantForDisplay } from "../lib/helpers";
import { ApplicantView } from "../schemas/applicantSchema";

/**
 * Represents filter parameters for querying applicants
 */
export type ApplicantFilters = {
  search?: string;
  verificationStatus?: "VERIFIED" | "UNVERIFIED" | "PARTIALLY_VERIFIED";
  bankId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/**
 * Retrieves a filtered list of applicants
 *
 * @param filters - Optional filter parameters
 * @returns A promise resolving to an ActionResponse containing applicant data or an error
 *
 * @example
 * // Success case with filters
 * const response = await getApplicants({
 *   search: "John",
 *   verificationStatus: "VERIFIED",
 *   page: 1,
 *   limit: 10
 * });
 * // => { success: true, message: "Applicant.toast.retrieved", data: [...], meta: { total: 5, page: 1 } }
 */
export async function getApplicants(filters: ApplicantFilters = {}): Promise<ActionResponse<ApplicantView[]>> {
  try {
    // Get the current user from the session
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get the user's ability based on their role
    const ability = await getAbility(user);

    // Check if the user can read applicants
    if (!ability.can("read", "Applicant")) {
      return { success: false, message: "errors.forbidden" };
    }

    // Extract filter parameters with defaults
    const {
      search = "",
      verificationStatus,
      bankId = user.currentRole?.bankId || undefined,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    // Build the where clause for filtering
    const where: any = {
      // Only include non-deleted records
      deletedAt: null,
    };

    // Add bank filter if specified or use current user's bank
    if (bankId) {
      where.bankId = bankId;
    }

    // Add verification status filter if specified
    if (verificationStatus) {
      if (verificationStatus === "VERIFIED") {
        where.aadharVerificationStatus = true;
        where.panVerificationStatus = true;
      } else if (verificationStatus === "UNVERIFIED") {
        where.aadharVerificationStatus = false;
        where.panVerificationStatus = false;
      } else if (verificationStatus === "PARTIALLY_VERIFIED") {
        // Complex OR condition for partially verified
        where.OR = [
          { aadharVerificationStatus: true, panVerificationStatus: false },
          { aadharVerificationStatus: false, panVerificationStatus: true },
        ];
      }
    }

    // Add search filter if specified
    if (search) {
      where.OR = [
        ...(where.OR || []),
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phoneNumber: { contains: search } },
            ],
          },
        },
        { aadharNumber: { contains: search } },
        { panNumber: { contains: search } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch the count of matching records
    const total = await prisma.applicant.count({ where });

    // Fetch applicants with pagination, sorting, and includes
    const applicants = await prisma.applicant.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        bank: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            loanApplications: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Format applicants for display
    const formattedApplicants = applicants.map((applicant) =>
      formatApplicantForDisplay({
        ...applicant,
        fullName: applicant.user
          ? `${applicant.user.firstName || ""} ${applicant.user.lastName || ""}`.trim()
          : undefined,
      }),
    );

    // Return success response with data and pagination metadata
    return {
      success: true,
      message: "Applicant.toast.listRetrieved",
      data: formattedApplicants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    // Handle unexpected errors
    return handleActionError({ type: "unexpected", error });
  }
}
