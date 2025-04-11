"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  PersonalInformationFormValues,
  PersonalInformationSchema,
} from "@/app/[locale]/saas/(private)/personal/schema";
import { ActionResponse } from "@/types/globalTypes";

export async function updateApplicant(id: string, formData: PersonalInformationFormValues): Promise<ActionResponse> {
  try {
    console.log("validated data 1");
    // Validate form data
    const validatedData = PersonalInformationSchema.parse(formData);
    console.log("validated data 2");

    // Check if applicant exists
    const existingApplicant = await prisma.applicant.findUnique({
      where: { id },
    });

    console.log("validated data 3");

    if (!existingApplicant) {
      return {
        success: false,
        message: "Applicant not found",
      };
    }

    // Update applicant in database - only update the fields that come from the form
    const updatedApplicant = await prisma.applicant.update({
      where: { id },
      data: {
        dateOfBirth:
          validatedData.dateOfBirth instanceof Date ? validatedData.dateOfBirth : new Date(validatedData.dateOfBirth),
        addressState: validatedData.addressState,
        addressCity: validatedData.addressCity,
        addressFull: validatedData.addressFull,
        addressPinCode: validatedData.addressPinCode,
        aadharNumber: validatedData.aadharNumber,
        panNumber: validatedData.panNumber,
        aadharVerificationStatus: Boolean(validatedData.aadharVerificationStatus),
        panVerificationStatus: Boolean(validatedData.panVerificationStatus),
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/applicants/list");
    revalidatePath(`/saas/applicants/${id}`);

    return {
      success: true,
      message: "Applicant updated successfully",
      data: updatedApplicant,
    };
  } catch (error) {
    console.error("Error updating applicant:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors,
      };
    }
    return {
      success: false,
      message: "Failed to update applicant",
      errors: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
