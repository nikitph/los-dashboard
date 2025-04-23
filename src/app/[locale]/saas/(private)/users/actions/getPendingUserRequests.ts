"use server";

import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { ApprovalStatus, PendingActionType } from "@prisma/client";

/**
 * Gets pending user creation requests for a specific bank
 *
 * @param {string} [bankId] - Bank ID to get pending requests for (defaults to current user's bank)
 * @returns {Promise<ActionResponse>} Response with pending request list or error
 */
export async function getPendingUserRequests(bankId?: string): Promise<ActionResponse> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user ability
    const ability = await getAbility(user);
    if (!ability.can("read", "PendingAction")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get bank ID (from parameter or current user)
    const bankContext = bankId || user.currentRole?.bankId;
    if (!bankContext) {
      return { success: false, message: "errors.invalidBankId" };
    }

    // Query pending actions
    const pendingRequests = await prisma.pendingAction.findMany({
      where: {
        bankId: bankContext,
        actionType: PendingActionType.REQUEST_BANK_USER_CREATION,
        status: ApprovalStatus.PENDING,
      },
      orderBy: { requestedAt: "desc" },
      include: {
        requestedBy: true,
      },
    });

    return {
      success: true,
      message: "Pending requests fetched successfully",
      data: pendingRequests,
    };
  } catch (error) {
    console.error("Error fetching pending user requests:", error);
    return {
      success: false,
      message: "errors.fetchFailed",
      errors: { root: "Failed to fetch pending requests" },
    };
  }
}
