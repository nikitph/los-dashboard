"use server";

import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { ApprovalStatus, PendingActionType } from "@prisma/client";
import { CreateUserInput, createUserSchema } from "../schemas/userSchema";

/**
 * Submits a pending request for user creation that must be approved
 *
 * @param {CreateUserInput} data - The user data to submit for approval
 * @returns {Promise<ActionResponse>} Response with pending request details or error
 *
 * @example
 * // Submit a pending user creation request
 * const response = await submitPendingUserRequest({
 * firstName: "John",
 * lastName: "Doe",
 * email: "john@example.com",
 * phoneNumber: "1234567890",
 * role: "LOAN_OFFICER",
 * bankId: "bank123"
 * });
 */
export async function submitPendingUserRequest(data: CreateUserInput): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user ability
    const ability = await getAbility(user);
    if (!ability.can("create", "PendingAction")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Validate the data
    const validation = createUserSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: "errors.validationFailed",
        errors: { root: "Users.errors.validationFailed" },
      };
    }

    const validatedData = validation.data;

    // Check for existing pending request with the same email
    const existingRequest = await prisma.pendingAction.findFirst({
      where: {
        bankId: validatedData.bankId,
        actionType: PendingActionType.REQUEST_BANK_USER_CREATION,
        status: ApprovalStatus.PENDING,
        payload: {
          path: ["email"],
          equals: validatedData.email,
        },
      },
    });

    if (existingRequest) {
      return {
        success: false,
        message: "errors.pendingRequestExists",
        errors: { email: "Users.errors.pendingRequestExists" },
      };
    }

    // Create pending action
    const pendingAction = await prisma.pendingAction.create({
      data: {
        payload: validatedData,
        requestedById: user.id,
        bankId: validatedData.bankId,
        targetModel: "UserProfile",
        actionType: PendingActionType.REQUEST_BANK_USER_CREATION,
        reviewedById: null,
        reviewRemarks: null,
        targetRecordId: null,
        deletedAt: null,
      },
    });

    return {
      success: true,
      message: "Users.toast.pendingRequestSubmitted",
      data: pendingAction,
    };
  } catch (error) {
    console.error("Error submitting pending user creation request:", error);
    return {
      success: false,
      message: "errors.unexpected",
      errors: { root: "Users.errors.unexpected" },
    };
  }
}
