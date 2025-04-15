"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Response Types
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

// Validation Schema
const incomeDetailSchema = z.object({
  year: z.number(),
  taxableIncome: z.number().nullable().optional(),
  taxPaid: z.number().nullable().optional(),
  grossIncome: z.number().nullable().optional(),
  rentalIncome: z.number().nullable().optional(),
  incomeFromBusiness: z.number().nullable().optional(),
  depreciation: z.number().nullable().optional(),
  grossCashIncome: z.number().nullable().optional(),
});

const formSchema = z.object({
  applicantId: z.string().uuid(),
  type: z.string().min(1),
  incomeDetails: z.array(incomeDetailSchema),
  dependents: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .optional(),
  averageMonthlyExpenditure: z
    .string()
    .transform((val) => {
      if (!val) return 0;
      // Handle percentage strings like "20% or more"
      if (val.includes("%")) {
        const percentMatch = val.match(/(\d+)/);
        return percentMatch ? parseInt(percentMatch[0], 10) / 100 : 0;
      }
      return parseFloat(val) || 0;
    })
    .optional(),
  averageGrossCashIncome: z
    .string()
    .transform((val) => (val ? parseFloat(val) : 0))
    .optional(),
});

export async function saveIncomeData(formData: FormData): Promise<ActionResponse> {
  try {
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
      formSchema.parse({
        applicantId,
        type,
        incomeDetails,
        dependents,
        averageMonthlyExpenditure,
        averageGrossCashIncome,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path.join(".")] = err.message;
        });

        console.log("fieldErrors", fieldErrors);

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

    // Transaction to create income and income details
    const result = await prisma.$transaction(async (tx) => {
      // Create the income record
      const income = await tx.income.create({
        data: {
          applicantId,
          type,
          dependents: parseInt(dependents || "0"),
          averageMonthlyExpenditure: parseFloat(averageMonthlyExpenditure) || 0,
          averageGrossCashIncome: parseFloat(averageGrossCashIncome || "0"),
        },
      });

      // Create income details for each year
      const incomeDetailPromises = incomeDetails.map((detail: any) => {
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
    revalidatePath("/applicant/[id]/income");

    return {
      success: true,
      message: "Income information saved successfully",
      data: result,
    };
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
