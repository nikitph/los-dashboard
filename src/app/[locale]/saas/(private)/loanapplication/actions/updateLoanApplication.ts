"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { enhanceLoanApplication } from "../lib/helpers";
import { UpdateLoanApplicationInput, updateLoanApplicationSchema } from "../schemas/loanApplicationSchema";

/**
 * Updates an existing loan application in the database
 *
 * @param {UpdateLoanApplicationInput} data - The loan application data to update, including ID
 * @returns {Promise<ActionResponse<any>>} Response with updated loan application or error
 * @throws Will throw an error if user lacks permission to update loan applications
 *
 * @example
 * // Success case
 * const response = await updateLoanApplication({
 *   id: "loan123",
 *   status: "APPROVED"
 * });
 * // => { success: true, message: "LoanApplication.toast.updated", data: { id: "loan123", ... } }
 */
export async function updateLoanApplication(rawData: UpdateLoanApplicationInput): Promise<ActionResponse<any>> {
  try {
    // Get authenticated user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user permissions
    const ability = await getAbility(user);
    if (!ability.can("update", "LoanApplication")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Validate the input data
    const validation = updateLoanApplicationSchema.safeParse(rawData);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const validatedData = validation.data;

    // Ensure ID is provided
    if (!validatedData.id) {
      return {
        success: false,
        message: "validation.id.required",
      };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "LoanApplication" });

    // Check if loan application exists
    const existingLoanApplication = await prisma.loanApplication.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingLoanApplication) {
      return {
        success: false,
        message: t("errors.notFound"),
      };
    }

    // Update the loan application
    const { id, ...updateData } = validatedData;
    const updatedLoanApplication = await prisma.loanApplication.update({
      where: { id },
      data: updateData,
      include: {
        applicant: true,
      },
    });

    // Transform data with derived fields
    const enhancedLoanApplication = enhanceLoanApplication(updatedLoanApplication);

    return {
      success: true,
      message: t("toast.updated"),
      data: enhancedLoanApplication,
    };
  } catch (error) {
    return handleActionError({ type: "unexpected", error });
  }
}
