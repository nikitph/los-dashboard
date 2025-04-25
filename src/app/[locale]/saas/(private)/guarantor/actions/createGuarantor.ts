"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getTranslations } from "next-intl/server";
import { CreateGuarantorInput, createGuarantorSchema } from "../schemas/guarantorSchema";

/**
 * Creates a new guarantor in the database
 *
 * @param {CreateGuarantorInput} data - The guarantor data
 * @returns {Promise<ActionResponse>} Response with created guarantor or error details
 *
 * @example
 * // Success case
 * const response = await createGuarantor({
 *   firstName: "John",
 *   lastName: "Doe",
 *   email: "john@example.com",
 *   // ... other fields
 * });
 * // => { success: true, message: "guarantor.toast.created", data: { id: "123", ... } }
 *
 * @example
 * // Error case - validation failure
 * const response = await createGuarantor({ firstName: "" });
 * // => { success: false, message: "errors.validationFailed", errors: { firstName: "guarantor.validation.firstName.required" } }
 */
export async function createGuarantor(data: CreateGuarantorInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Check if user has permission to create guarantors
    const ability = await getAbility(user);
    if (!ability.can("create", "Guarantor")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: "en", namespace: "Guarantor" });

    // Validate the data
    const validation = createGuarantorSchema.safeParse(data);
    if (!validation.success) {
      return handleActionError({ type: "validation", error: validation.error });
    }

    // Check if the loan application exists and user has access to it
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id: data.loanApplicationId },
    });

    if (!loanApplication) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { loanApplicationId: "guarantor.validation.loanApplicationId.notFound" },
      };
    }

    // Check if user has permission to access this loan application
    if (!ability.can("read", "LoanApplication")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Create the guarantor
    const guarantor = await prisma.guarantor.create({
      data: {
        ...validation.data,
      },
    });

    return {
      success: true,
      message: t("toast.created"),
      data: guarantor,
    };
  } catch (error) {
    // Log the error
    console.error("Error creating guarantor:", error);

    // Return a generic error response
    return handleActionError({ type: "unexpected", error });
  }
}
