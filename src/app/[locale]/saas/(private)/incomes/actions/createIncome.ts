"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import { incomeFormSchema } from "../schemas/incomeSchema";
import { getServerSessionUser } from "@/lib/getServerUser";
import { ActionResponse } from "@/types/globalTypes";

/**
 * Creates a new income record with associated income details
 * @param formData - The form data containing income and income details information
 * @returns ActionResponse with success/error status and data
 */
export async function createIncome(formData: FormData): Promise<ActionResponse> {
  try {
    // Check user authorization
    const user = await getServerSessionUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized access",
      };
    }

    // Extract and validate form data
    const applicantId = formData.get("applicantId") as string;
    const type = formData.get("type") as string;
    const incomeDetailsString = formData.get("incomeDetails") as string;
    const dependents = formData.get("dependents") as string;
    const averageMonthlyExpenditure = formData.get("averageMonthlyExpenditure") as string;
    const averageGrossCashIncome = formData.get("averageGrossCashIncome") as string;

    if (!applicantId || !type || !incomeDetailsString) {
      return {
        success: false,
        message: "Missing required fields",
        errors: {
          form: "Please provide all required information",
        },
      };
    }

    let incomeDetails;
    try {
      incomeDetails = JSON.parse(incomeDetailsString);

      // Validate the parsed data
      const validatedData = incomeFormSchema.parse({
        applicantId,
        type,
        incomeDetails,
        dependents,
        averageMonthlyExpenditure,
        averageGrossCashIncome,
      });

      // Transaction to create income and income details
      const result = await prisma.$transaction(async (tx) => {
        // Create the income record
        const income = await tx.income.create({
          data: {
            applicantId: validatedData.applicantId,
            type: validatedData.type,
            dependents: validatedData.dependents || 0,
            averageMonthlyExpenditure: validatedData.averageMonthlyExpenditure || 0,
            averageGrossCashIncome: validatedData.averageGrossCashIncome || 0,
          },
        });

        // Create income details for each year
        const incomeDetailPromises = validatedData.incomeDetails.map((detail) => {
          return tx.incomeDetail.create({
            data: {
              incomeId: income.id,
              year: detail.year,
              taxableIncome: detail.taxableIncome,
              taxPaid: detail.taxPaid,
              grossIncome: detail.grossIncome,
              rentalIncome: detail.rentalIncome,
              incomeFromBusiness: detail.incomeFromBusiness,
              depreciation: detail.depreciation,
              grossCashIncome: detail.grossCashIncome,
            },
          });
        });

        const createdIncomeDetails = await Promise.all(incomeDetailPromises);

        return { income, incomeDetails: createdIncomeDetails };
      });

      // Revalidate the path to update UI
      revalidatePath("/saas/(private)/incomes");
      revalidatePath(`/saas/(private)/applicant/${applicantId}`);

      return {
        success: true,
        message: "Income information saved successfully",
        data: result,
      };
    } catch (error: any) {
      console.error("Validation error:", error);

      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          fieldErrors[err.path.join(".")] = err.message;
        });

        return {
          success: false,
          message: "Validation error",
          errors: fieldErrors,
        };
      }

      return {
        success: false,
        message: "Invalid data format",
        errors: {
          form: "Please check your input data",
        },
      };
    }
  } catch (error) {
    console.error("Error saving income data:", error);

    return {
      success: false,
      message: "Failed to save income information",
      errors: {
        server: "An unexpected error occurred",
      },
    };
  }
}
