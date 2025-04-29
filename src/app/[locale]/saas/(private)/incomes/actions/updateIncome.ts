"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import { incomeFormSchema } from "../schemas/incomeSchema";
import { getServerSessionUser } from "@/lib/getServerUser";
import { ActionResponse } from "@/types/globalTypes";

/**
 * Updates an existing income record with associated income details
 * @param formData - The form data containing income and income details information
 * @returns ActionResponse with success/error status and data
 */
export async function updateIncome(formData: FormData): Promise<ActionResponse> {
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
    const id = formData.get("id") as string;
    const applicantId = formData.get("applicantId") as string;
    const type = formData.get("type") as string;
    const incomeDetailsString = formData.get("incomeDetails") as string;
    const dependents = formData.get("dependents") as string;
    const averageMonthlyExpenditure = formData.get("averageMonthlyExpenditure") as string;
    const averageGrossCashIncome = formData.get("averageGrossCashIncome") as string;

    if (!id || !applicantId || !type || !incomeDetailsString) {
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
        id,
        applicantId,
        type,
        incomeDetails,
        dependents,
        averageMonthlyExpenditure,
        averageGrossCashIncome,
      });

      // Transaction to update income and income details
      const result = await prisma.$transaction(async (tx) => {
        // Update the income record
        const income = await tx.income.update({
          where: { id },
          data: {
            type: validatedData.type,
            dependents: validatedData.dependents || 0,
            averageMonthlyExpenditure: validatedData.averageMonthlyExpenditure || 0,
            averageGrossCashIncome: validatedData.averageGrossCashIncome || 0,
          },
        });

        // Process income details - handle updates, creates, and implicit deletes
        const existingIncomeDetails = await tx.incomeDetail.findMany({
          where: { incomeId: id },
        });

        // Map existing details by ID for easier lookup
        const existingDetailsMap = new Map(existingIncomeDetails.map((detail) => [detail.id, detail]));

        // Process each income detail from the form
        const incomeDetailPromises = validatedData.incomeDetails.map(async (detail) => {
          if (detail.id) {
            // Update existing detail
            return tx.incomeDetail.update({
              where: { id: detail.id },
              data: {
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
          } else {
            // Create new detail
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
          }
        });

        // Find details to delete (those in DB but not in the form submission)
        const formDetailIds = new Set(validatedData.incomeDetails.filter((d) => d.id).map((d) => d.id as string));

        const detailsToDelete = existingIncomeDetails.filter((detail) => !formDetailIds.has(detail.id));

        // Delete income details that are no longer present
        const deletePromises = detailsToDelete.map((detail) =>
          tx.incomeDetail.delete({
            where: { id: detail.id },
          }),
        );

        // Execute all promises
        const [updatedIncomeDetails, deletedDetails] = await Promise.all([
          Promise.all(incomeDetailPromises),
          Promise.all(deletePromises),
        ]);

        return {
          income,
          incomeDetails: updatedIncomeDetails,
          deletedDetails,
        };
      });

      // Revalidate the path to update UI
      revalidatePath("/saas/(private)/incomes");
      revalidatePath(`/saas/(private)/incomes/${id}`);
      revalidatePath(`/saas/(private)/applicant/${applicantId}`);

      return {
        success: true,
        message: "Income information updated successfully",
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
    console.error("Error updating income data:", error);

    return {
      success: false,
      message: "Failed to update income information",
      errors: {
        server: "An unexpected error occurred",
      },
    };
  }
}
