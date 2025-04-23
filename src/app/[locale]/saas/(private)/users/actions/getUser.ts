"use server";

import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { UserRecord } from "../schemas/userSchema";

/**
 * Retrieves a single user by ID
 *
 * @param {string} userId - The ID of the user to retrieve
 * @param {string} [bankId] - Bank ID context (defaults to current user's bank)
 * @returns {Promise<ActionResponse<UserRecord>>} Response with user data or error details
 *
 * @example
 * // Get a user
 * const response = await getUser("user123");
 */
export async function getUser(userId: string, bankId?: string): Promise<ActionResponse<UserRecord>> {
  try {
    // Get current user and check permissions
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user ability
    const ability = await getAbility(user);
    if (!ability.can("read", "UserProfile")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get bank ID (from parameter or current user)
    const bankContext = bankId || user.currentRole?.bankId;
    if (!bankContext) {
      return { success: false, message: "errors.invalidBankId" };
    }

    // Find the user by userId in the context of the bank
    const userRole = await prisma.userRoles.findFirst({
      where: {
        userId: userId,
        bankId: bankContext,
        role: { not: "APPLICANT" },
      },
      include: {
        user: true,
      },
    });

    if (!userRole) {
      return {
        success: false,
        message: "errors.notFound",
        errors: { root: "Users.errors.userNotFound" },
      };
    }

    // Transform to user record
    const userRecord: UserRecord = {
      id: userRole.userId,
      firstName: userRole.user.firstName ?? "",
      lastName: userRole.user.lastName ?? "",
      email: userRole.user.email ?? "",
      phoneNumber: userRole.user.phoneNumber ?? "",
      role: userRole.role,
      status: "Active", // Hardcoded for now, would come from a real status field
      lastLogin: "N/A", // Would be obtained from auth provider in a real implementation
      branch: userRole.bankId ? "Main Branch" : "Unknown", // This would be dynamic in a real implementation
      avatarUrl: undefined,
    };

    return {
      success: true,
      message: "User fetched successfully",
      data: userRecord,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      message: "errors.fetchFailed",
      errors: { root: "Failed to fetch user details" },
    };
  }
}
