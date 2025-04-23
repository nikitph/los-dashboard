"use server";

import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { ApprovalStatus } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";

/**
 * Rejects a pending user creation request
 *
 * @param {string} pendingActionId - ID of the pending action to reject
 * @param {string} [remarks] - Optional remarks explaining the rejection
 * @returns {Promise<ActionResponse>} Response with rejection result or error
 */
export async function rejectPendingUserRequest(pendingActionId: string, remarks?: string): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user ability
    const ability = await getAbility(user);
    if (!ability.can("update", "PendingAction")) {
      return { success: false, message: "errors.unauthorized" };
    }

    const locale = await getLocale();

    // Update pending action to rejected
    await prisma.pendingAction.update({
      where: { id: pendingActionId },
      data: {
        status: ApprovalStatus.REJECTED,
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewRemarks: remarks || null,
      },
    });

    // Revalidate path to refresh the UI
    revalidatePath(`/${locale}/saas/users/list`);

    return {
      success: true,
      message: "Users.toast.pendingRequestRejected",
    };
  } catch (error) {
    console.error("Error rejecting pending user request:", error);
    return {
      success: false,
      message: "errors.unexpected",
      errors: { root: "Users.errors.unexpected" },
    };
  }
}
