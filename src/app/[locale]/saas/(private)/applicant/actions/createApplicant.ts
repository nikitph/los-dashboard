"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { formatApplicantForDisplay } from "../lib/helpers";
import { ApplicantView, CreateApplicantInput, createApplicantSchema } from "../schemas/applicantSchema";

/**
 * Creates a new applicant
 *
 * @param data - The applicant data to create
 * @returns A promise resolving to an ActionResponse containing the created applicant or an error
 *
 * @example
 * // Success case
 * const response = await createApplicant({
 *   userId: "user123",
 *   bankId: "bank456",
 *   dateOfBirth: new Date("1990-01-01"),
 *   addressState: "Karnataka",
 *   // ... other fields
 * });
 * // => { success: true, message: "Applicant.toast.created", data: { id: "app123", ... } }
 *
 * @example
 * // Error case - validation failure
 * const response = await createApplicant({
 *   // Missing required fields
 * });
 * // => { success: false, message: "errors.validationFailed", errors: { ... } }
 */
export async function createApplicant(rawData: CreateApplicantInput): Promise<ActionResponse<ApplicantView>> {
  try {
    // Get the current user from the session
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get the user's ability based on their role
    const ability = await getAbility(user);

    // Check if the user can create applicants
    if (!ability.can("create", "Applicant")) {
      return { success: false, message: "errors.forbidden" };
    }

    // Validate the input data
    const validation = createApplicantSchema.safeParse(rawData);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const validatedData = validation.data;

    // Default bankId to the user's bank if not provided
    const bankId = validatedData.bankId || user.currentRole?.bankId;
    if (!bankId) {
      return {
        success: false,
        message: "errors.validation",
        errors: { bankId: "validation.bankId.required" },
      };
    }

    // Create the new applicant
    const newApplicant = await prisma.applicant.create({
      data: {
        ...validatedData,
        bankId,
      },
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
      },
    });

    // Format the applicant for display
    const formattedApplicant = formatApplicantForDisplay({
      ...newApplicant,
      fullName: newApplicant.user
        ? `${newApplicant.user.firstName || ""} ${newApplicant.user.lastName || ""}`.trim()
        : undefined,
    });

    // Return a success response with the formatted applicant data
    return {
      success: true,
      message: "Applicant.toast.created",
      data: formattedApplicant,
    };
  } catch (error: any) {
    // Handle specific database errors
    if (error?.code === "P2002") {
      // P2002 is Prisma's unique constraint violation error
      return {
        success: false,
        message: "errors.duplicateEntry",
        errors: {
          root: "Applicant.errors.alreadyExists",
        },
      };
    }

    // Handle other unexpected errors
    return handleActionError({ type: "unexpected", error });
  }
}
