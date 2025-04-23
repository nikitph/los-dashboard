"use server";

import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { ApprovalStatus } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { createUser } from "./createUser";
import { CreateUserInput } from "@/app/[locale]/saas/(private)/users/schemas/userSchema";

/**
 * Approves a pending user creation request and creates the user
 *
 * @param {string} pendingActionId - ID of the pending action to approve
 * @returns {Promise<ActionResponse>} Response with approval result or error
 */
export async function approvePendingUserRequest(pendingActionId: string): Promise<ActionResponse> {
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

    // Update pending action to approved
    const updatedPendingAction = await prisma.pendingAction.update({
      where: { id: pendingActionId },
      data: {
        status: ApprovalStatus.APPROVED,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });

    const createUserResult = await createUser(updatedPendingAction.payload as CreateUserInput);

    // Revalidate paths to refresh the UI
    revalidatePath(`/${locale}/saas/users/list`);

    return createUserResult;
  } catch (error) {
    console.error("Error approving pending user request:", error);
    return {
      success: false,
      message: "errors.unexpected",
      errors: { root: "Users.errors.unexpected" },
    };
  }
}
