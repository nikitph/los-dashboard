"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";

// Response types
export type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
};

export type ErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string>;
};

export type ActionResponse<T = any> = SuccessResponse<T> | ErrorResponse;

const prisma = new PrismaClient();

// Define validation schema - same as in the form component
const loanDetailSchema = z.object({
  outstandingLoan: z.string().refine((val) => !isNaN(Number(val)) && val !== "", {
    message: "Must be a valid number",
  }),
  emiAmount: z.string().refine((val) => !isNaN(Number(val)) && val !== "", {
    message: "Must be a valid number",
  }),
  loanDate: z.string().min(1, { message: "Loan date is required" }),
  loanType: z.string().min(1, { message: "Loan type is required" }),
  bankName: z.string().min(1, { message: "Bank name is required" }),
});

// Whole form schema
const formSchema = z.object({
  cibilScore: z
    .string()
    .refine((val) => !isNaN(Number(val)) && val !== "", {
      message: "CIBIL score must be a valid number",
    })
    .refine((val) => Number(val) >= 300 && Number(val) <= 900, {
      message: "CIBIL score must be between 300 and 900",
    }),
  loans: z.array(loanDetailSchema),
});

type FormData = z.infer<typeof formSchema>;

/**
 * Creates or updates loan obligations for an applicant
 */
export async function saveLoanObligations(
  applicantId: string,
  formData: FormData,
): Promise<ActionResponse<{ loanObligation: any; loanDetails: any[] }>> {
  try {
    // Validate form data using Zod
    const validatedData = formSchema.parse(formData);

    // Calculate total loan and EMI from the form data
    const totalLoan = validatedData.loans.reduce((sum, loan) => sum + Number(loan.outstandingLoan), 0);

    const totalEmi = validatedData.loans.reduce((sum, loan) => sum + Number(loan.emiAmount), 0);

    // Create or update the LoanObligation record
    const loanObligation = await prisma.loanObligation.upsert({
      where: {
        // Assuming we might have a unique constraint on applicantId
        // If not, you may need to query for existing records first
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
      message: "Loan obligations saved successfully",
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
        message: "Validation failed",
        errors: formattedErrors,
      };
    }

    return {
      success: false,
      message: "Failed to save loan obligations",
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
export async function getLoanObligations(applicantId: string): Promise<ActionResponse<FormData>> {
  try {
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
      const formData: FormData = {
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
        message: "Loan obligations retrieved successfully",
        data: formData,
      };
    }

    // Return empty form data if no records found
    return {
      success: true,
      message: "No existing loan obligations found",
      data: {
        cibilScore: "",
        loans: [{ outstandingLoan: "", emiAmount: "", loanDate: "", loanType: "", bankName: "" }],
      },
    };
  } catch (error) {
    console.error("Error retrieving loan obligations:", error);
    return {
      success: false,
      message: "Failed to retrieve loan obligations",
    };
  }
}

/**
 * Soft deletes a loan obligation record
 */
export async function deleteLoanObligation(loanObligationId: string): Promise<ActionResponse> {
  try {
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
      message: "Loan obligation deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting loan obligation:", error);
    return {
      success: false,
      message: "Failed to delete loan obligation",
    };
  }
}

/**
 * Handles form submission and redirects to the next page
 */
export async function submitLoanObligationsForm(applicantId: string, formData: FormData): Promise<ActionResponse> {
  const result = await saveLoanObligations(applicantId, formData);

  if (result.success) {
    // This line won't be reached due to the redirect, but TypeScript needs a return
    return result;
  } else {
    // This will be handled by the form component to display errors
    return result;
  }
}
