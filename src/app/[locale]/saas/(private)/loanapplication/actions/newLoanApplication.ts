"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { prisma } from "@/lib/prisma/prisma";
import {
  NewLoanApplicationInput,
  newLoanApplicationSchema
} from "@/app/[locale]/saas/(private)/loanapplication/schemas/loanApplicationSchema";
import { ActionResponse } from "@/types/globalTypes";
import { handleActionError } from "@/lib/actionErrorHelpers";

/**
 * Create a new loan application through initial form data
 * - Uses provided authId from client (if available)
 * - Check if user profile exists
 * - Create user profile if needed
 * - Create applicant if needed
 * - Create loan application
 */
export async function createNewLoanApplication(formData: NewLoanApplicationInput): Promise<ActionResponse> {
  try {
    const validatedData = newLoanApplicationSchema.parse(formData);
    const bank = await prisma.bank.findUnique({
      where: { id: validatedData.bankId },
      select: { id: true },
    });

    /* Simple check just in case */
    if (!bank) {
      return {
        success: false,
        message: "errors.bankDoesNotExist",
        errors: { root: "errors.bankDoesNotExist" },
      };
    }

    /*
     * We are going to assume UserProfile as the source of truth for all users.
     * The trigger on auth.users is Critical for this part
     */
    const userProfile = await prisma.userProfile.findUnique({
      where: { phoneNumber: validatedData.phoneNumber },
    });

    if (userProfile) {
      /* If user profile exists assume a userRole and create an applicant record */
      const applicant = await prisma.applicant.create({
        data: {
          bankId: validatedData.bankId,
          userId: userProfile.id,
          dateOfBirth: new Date(),
          addressState: "Unknown",
          addressCity: "Unknown",
          addressFull: "Unknown",
          addressPinCode: "000000",
          aadharNumber: "000000000000",
          panNumber: "XXXXX0000X",
          aadharVerificationStatus: false,
          panVerificationStatus: false,
          photoUrl: "",
        },
      });

      /* Now Create the loan application record */
      const loanApplication = await prisma.loanApplication.create({
        data: {
          applicantId: applicant.id,
          bankId: validatedData.bankId,
          loanType: validatedData.loanType,
          amountRequested: parseFloat(validatedData.amountRequested),
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Loan application created successfully",
        data: loanApplication,
      };
    } else {
      /* No User profile. Safe to assume user is new */
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SERVICE_ROLE_KEY!);
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        phone: validatedData.phoneNumber,
        email: validatedData.email,
        email_confirm: true,
        user_metadata: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          phone: validatedData.phoneNumber,
        },
      });

      if (authError) {
        if (authError.message.includes("already exists")) {
          return {
            success: false,
            message: "errors.userExists",
            errors: { email: "errors.userExists" },
          };
        }

        if (authError.code?.includes("phone_exists")) {
          return {
            success: false,
            message: "errors.phoneExists",
            errors: { phoneNumber: "errors.phoneExists" },
          };
        }

        return {
          success: false,
          message: "errors.createFailed",
          errors: { root: authError.message },
        };
      }

      if (!authData?.user?.id) {
        return {
          success: false,
          message: "errors.unexpected",
          errors: { root: "errors.unexpected" },
        };
      }

      const userProfile = await prisma.userProfile.findUnique({
        where: { phoneNumber: validatedData.phoneNumber },
      });

      if (!userProfile) {
        return {
          success: false,
          message: "errors.unexpected",
          errors: { root: "errors.unexpected" },
        };
      }

      const applicant = await prisma.applicant.create({
        data: {
          bankId: validatedData.bankId,
          userId: userProfile.id,
          dateOfBirth: new Date(),
          addressState: "Unknown",
          addressCity: "Unknown",
          addressFull: "Unknown",
          addressPinCode: "000000",
          aadharNumber: "000000000000",
          panNumber: "XXXXX0000X",
          aadharVerificationStatus: false,
          panVerificationStatus: false,
          photoUrl: "",
        },
      });

      /* Now Create the loan application record */
      const loanApplication = await prisma.loanApplication.create({
        data: {
          applicantId: applicant.id,
          bankId: validatedData.bankId,
          loanType: validatedData.loanType,
          amountRequested: parseFloat(validatedData.amountRequested),
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Loan application created successfully",
        data: loanApplication,
      };
    }
  } catch (error) {
    console.error("Error creating initial loan application:", error);
    if (error instanceof z.ZodError) {
      return handleActionError({ type: "validation", error: error });
    }
    return {
      success: false,
      message: "Failed to create loan application",
      errors: { root: "errors.unexpected" },
    };
  }
}
