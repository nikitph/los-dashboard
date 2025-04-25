"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { formatApplicantForDisplay } from "../lib/helpers";
import { ApplicantView } from "../schemas/applicantSchema";

/**
 * Retrieves a single applicant by ID
 *
 * @param id - The ID of the applicant to retrieve
 * @returns A promise resolving to an ActionResponse containing the applicant data or an error
 *
 * @example
 * // Success case
 * const response = await getApplicant("123");
 * // => { success: true, message: "Applicant.toast.retrieved", data: { id: "123", ... } }
 *
 * @example
 * // Error case - applicant not found
 * const response = await getApplicant("nonexistent-id");
 * // => { success: false, message: "errors.notFound" }
 */
export async function getApplicant(id: string): Promise<ActionResponse<ApplicantView>> {
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

    // Fetch the applicant with related user information
    const applicant = await prisma.applicant.findUnique({
      where: { id },
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
        // Include counts of related entities
        _count: {
          select: {
            dependents: true,
            documents: true,
            incomes: true,
            loanApplications: true,
            loanObligations: true,
          },
        },
      },
    });

    // Return error if applicant not found
    if (!applicant) {
      return { success: false, message: "errors.notFound" };
    }

    // Return a success response with the formatted applicant data
    return {
      success: true,
      message: "Applicant.toast.retrieved",
      data: formatApplicantForDisplay({
        ...applicant,
        // Add full name from user profile data
        fullName: applicant.user
          ? `${applicant.user.firstName || ""} ${applicant.user.lastName || ""}`.trim()
          : undefined,
      }),
    };
  } catch (error) {
    // Handle unexpected errors and return an appropriate error response
    return handleActionError({ type: "unexpected", error });
  }
}
