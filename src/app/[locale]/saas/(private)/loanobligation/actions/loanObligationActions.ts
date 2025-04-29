"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { LoanObligationFormValues, loanObligationSchema } from "../schemas/loanObligationSchema";
import { ActionResponse } from "@/types/globalTypes";

/**
 * Creates or updates loan obligations for an applicant
 */
export async function saveLoanObligation(
  applicantId: string,
  formData: LoanObligationFormValues,
): Promise<ActionResponse<{ loanObligation: any; loanDetails: any[] }>> {
  try {
    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "LoanObligations" });

    // Validate form data using Zod
    const validatedData = loanObligationSchema.parse(formData);

    // Calculate total loan and EMI from the form data
    const totalLoan = validatedData.loans.reduce((sum, loan) => sum + Number(loan.outstandingLoan), 0);
    const totalEmi = validatedData.loans.reduce((sum, loan) => sum + Number(loan.emiAmount), 0);

    // Create or update the LoanObligation record
    const loanObligation = await prisma.loanObligation.upsert({
      where: {
        id: (await getLoanObligationIdByApplicantId(applicantId)) || "",
      },
      create: {
        applicantId,
        cibilScore: validatedData.cibilScore ? parseFloat(validatedData.cibilScore) : null,
        totalLoan,
        totalEmi,
      },
      update: {
        cibilScore: validatedData.cibilScore ? parseFloat(validatedData.cibilScore) : null,
        totalLoan,
        totalEmi,
        updatedAt: new Date(),
      },
    });

    // Delete existing loan details to replace with new ones
    await prisma.loanObligationDetail.deleteMany({
      where: {
        loanObligationId: loanObligation.id,
        deletedAt: null, // Only delete active records
      },
    });

    // Create new loan details
    const loanDetails = await Promise.all(
      validatedData.loans.map(async (loan) => {
        return prisma.loanObligationDetail.create({
          data: {
            loanObligationId: loanObligation.id,
            outstandingLoan: parseFloat(loan.outstandingLoan),
            emiAmount: parseFloat(loan.emiAmount),
            loanDate: new Date(loan.loanDate), // Convert string date to Date object
            loanType: loan.loanType,
            bankName: loan.bankName,
          },
        });
      }),
    );

    revalidatePath(`/applications/${applicantId}`);
    return {
      success: true,
      message: t("toast.success"),
      data: { loanObligation, loanDetails },
    };
  } catch (error) {
    console.error("Error saving loan obligations:", error);
    if (error instanceof z.ZodError) {
      // Format Zod errors into the required structure
      const formattedErrors: Record<string, string> = {};

      error.errors.forEach((err) => {
        // Handle array paths like loans[0].outstandingLoan
        const path = err.path.join(".");
        formattedErrors[path] = err.message;
      });

      return {
        success: false,
        message: "errors.validationFailed",
        errors: formattedErrors,
      };
    }

    return {
      success: false,
      message: "errors.unexpected",
    };
  }
}

/**
 * Helper function to get the loan obligation ID for an applicant
 */
async function getLoanObligationIdByApplicantId(applicantId: string): Promise<string | null> {
  const existingLoanObligation = await prisma.loanObligation.findFirst({
    where: {
      applicantId,
      deletedAt: null, // Only consider active records
    },
    select: {
      id: true,
    },
  });

  return existingLoanObligation?.id || null;
}

/**
 * Retrieves loan obligations data for an applicant
 */
export async function getLoanObligation(applicantId: string): Promise<ActionResponse<LoanObligationFormValues>> {
  try {
    const locale = await getLocale();
    const t = await getTranslations({ locale, namespace: "LoanObligations" });

    const loanObligation = await prisma.loanObligation.findFirst({
      where: {
        applicantId,
        deletedAt: null,
      },
      include: {
        loanDetails: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    // Transform data to match the form structure
    if (loanObligation) {
      const formData: LoanObligationFormValues = {
        cibilScore: loanObligation.cibilScore?.toString() || "",
        loans: loanObligation.loanDetails.map((detail) => ({
          outstandingLoan: detail.outstandingLoan.toString(),
          emiAmount: detail.emiAmount.toString(),
          loanDate: detail.loanDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
          loanType: detail.loanType,
          bankName: detail.bankName,
        })),
      };

      // If no loan details exist, provide an empty form row
      if (formData.loans.length === 0) {
        formData.loans = [{ outstandingLoan: "", emiAmount: "", loanDate: "", loanType: "", bankName: "" }];
      }

      return {
        success: true,
        message: t("toast.success"),
        data: formData,
      };
    }

    // Return empty form data if no records found
    return {
      success: true,
      message: "list.noObligationsFound",
      data: {
        cibilScore: "",
        loans: [{ outstandingLoan: "", emiAmount: "", loanDate: "", loanType: "", bankName: "" }],
      },
    };
  } catch (error) {
    console.error("Error retrieving loan obligations:", error);
    return {
      success: false,
      message: "errors.unexpected",
    };
  }
}

/**
 * Retrieves all loan obligations
 */
export async function getLoanObligations(): Promise<ActionResponse<any[]>> {
  try {
    const locale = await getLocale();
    const t = await getTranslations({ locale, namespace: "LoanObligations" });

    const loanObligations = await prisma.loanObligation.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        applicant: true,
        loanDetails: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    return {
      success: true,
      message: t("toast.success"),
      data: loanObligations,
    };
  } catch (error) {
    console.error("Error retrieving loan obligations:", error);
    return {
      success: false,
      message: "errors.unexpected",
    };
  }
}

/**
 * Retrieves a specific loan obligation by ID
 */
export async function getLoanObligationById(id: string): Promise<ActionResponse<any>> {
  try {
    const locale = await getLocale();
    const t = await getTranslations({ locale, namespace: "LoanObligations" });

    const loanObligation = await prisma.loanObligation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        applicant: true,
        loanDetails: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!loanObligation) {
      return {
        success: false,
        message: "errors.notFound",
      };
    }

    return {
      success: true,
      message: t("toast.success"),
      data: loanObligation,
    };
  } catch (error) {
    console.error("Error retrieving loan obligation:", error);
    return {
      success: false,
      message: "errors.unexpected",
    };
  }
}

/**
 * Soft deletes a loan obligation record
 */
export async function deleteLoanObligation(loanObligationId: string): Promise<ActionResponse> {
  try {
    const locale = await getLocale();
    const t = await getTranslations({ locale, namespace: "LoanObligations" });

    // Soft delete the loan obligation
    await prisma.loanObligation.update({
      where: { id: loanObligationId },
      data: { deletedAt: new Date() },
    });

    // Soft delete all related loan details
    await prisma.loanObligationDetail.updateMany({
      where: { loanObligationId },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: t("toast.deleted"),
    };
  } catch (error) {
    console.error("Error deleting loan obligation:", error);
    return {
      success: false,
      message: "errors.unexpected",
    };
  }
}
