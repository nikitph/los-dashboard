"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { enhanceLoanApplication } from "../lib/helpers";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";

/**
 * Retrieves a loan application by ID from the database
 *
 * @param {string} id - The ID of the loan application to retrieve
 * @returns {Promise<ActionResponse<LoanApplicationView>>} Response with loan application data or error
 * @throws Will throw an error if user lacks permission to read loan applications
 *
 * @example
 * // Success case
 * const response = await getLoanApplication("loan123");
 * // => { success: true, data: { id: "loan123", applicantId: "app456", ... } }
 */
export async function getLoanApplication(id: string): Promise<ActionResponse<LoanApplicationView>> {
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

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "LoanApplication" });

    // Retrieve the loan application
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        applicant: true,
        guarantors: true,
        coApplicants: true,
        verifications: true,
        documents: true,
      },
    });

    if (!loanApplication) {
      return {
        success: false,
        message: t("errors.notFound"),
      };
    }

    // Transform data with derived fields
    const enhancedLoanApplication = enhanceLoanApplication(loanApplication);

    return {
      success: true,
      message: t("toast.fetched"),
      data: enhancedLoanApplication,
    };
  } catch (error) {
    return handleActionError({ type: "unexpected", error });
  }
}
