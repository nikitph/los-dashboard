"use server";

import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { ApprovalStatus } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";

/**
 * Cancels a pending user creation request (by the requester)
 *
 * @param {string} pendingActionId - ID of the pending action to cancel
 * @returns {Promise<ActionResponse>} Response with cancellation result or error
 */
export async function cancelPendingUserRequest(pendingActionId: string): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get the pending action to verify it belongs to the current user
    const pendingAction = await prisma.pendingAction.findUnique({
      where: { id: pendingActionId },
    });

    if (!pendingAction) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { root: "Users.errors.pendingRequestNotFound" },
      };
    }

    // Verify the user is the one who created the request
    // or has management permissions
    const ability = await getAbility(user);
    if (pendingAction.requestedById !== user.id && !ability.can("manage", "PendingAction")) {
      return { success: false, message: "errors.unauthorized" };
    }

    const locale = await getLocale();

    // Update pending action to cancelled
    await prisma.pendingAction.update({
      where: { id: pendingActionId },
      data: {
        status: ApprovalStatus.CANCELLED,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });

    // Revalidate path to refresh the UI
    revalidatePath(`/${locale}/saas/users/list`);

    return {
      success: true,
      message: "Users.toast.pendingRequestCancelled",
    };
  } catch (error) {
    console.error("Error cancelling pending user request:", error);
    return {
      success: false,
      message: "errors.unexpected",
      errors: { root: "Users.errors.unexpected" },
    };
  }
}
