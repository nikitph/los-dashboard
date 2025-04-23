"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { CreateLoanApplicationInput, createLoanApplicationSchema } from "../schemas/loanApplicationSchema";

/**
 * Creates a new loan application in the database
 *
 * @param {CreateLoanApplicationInput} data - The validated loan application data
 * @returns {Promise<ActionResponse<any>>} Response with created loan application or error
 * @throws Will throw an error if user lacks permission to create loan applications
 *
 * @example
 * // Success case
 * const response = await createLoanApplication({
 *   applicantId: "app123",
 *   bankId: "bank456",
 *   loanType: "PERSONAL",
 *   amountRequested: 50000,
 *   status: "PENDING"
 * });
 * // => { success: true, message: "LoanApplication.toast.created", data: { id: "loan789", ... } }
 */
export async function createLoanApplication(rawData: CreateLoanApplicationInput): Promise<ActionResponse<any>> {
  try {
    // Get authenticated user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user permissions
    const ability = await getAbility(user);
    if (!ability.can("create", "LoanApplication")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Validate the input data
    const validation = createLoanApplicationSchema.safeParse(rawData);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    const validatedData = validation.data;

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "LoanApplication" });

    // Create the loan application
    const newLoanApplication = await prisma.loanApplication.create({
      data: {
        applicantId: validatedData.applicantId,
        bankId: validatedData.bankId,
        loanType: validatedData.loanType,
        amountRequested: validatedData.amountRequested,
        status: validatedData.status,
      },
      include: {
        applicant: true,
      },
    });

    return {
      success: true,
      message: t("toast.created"),
      data: newLoanApplication,
    };
  } catch (error) {
    return handleActionError({ type: "unexpected", error });
  }
}
