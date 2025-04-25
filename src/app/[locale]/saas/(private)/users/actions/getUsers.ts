"use server";

import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { UserRecord } from "../schemas/userSchema";

/**
 * Retrieves users for a specific bank
 *
 * @param {object} options - Query options
 * @param {string} [options.bankId] - Bank ID to filter users by (defaults to current user's bank)
 * @param {string} [options.role] - Filter by role
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.search] - Search term for name or email
 * @returns {Promise<ActionResponse<UserRecord[]>>} Response with users or error details
 *
 * @example
 * // Get all users for current user's bank
 * const response = await getUsers();
 *
 * @example
 * // Get users with filters
 * const response = await getUsers({
 *   bankId: "bank123",
 *   role: "LOAN_OFFICER",
 *   status: "Active",
 *   search: "john"
 * });
 */
export async function getUsers(
  options: {
    bankId?: string;
    role?: string;
    status?: string;
    search?: string;
  } = {},
): Promise<ActionResponse<UserRecord[]>> {
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

    // Get bank ID (from options or current user)
    const bankId = options.bankId || user.currentRole?.bankId;
    if (!bankId) {
      return { success: false, message: "errors.invalidBankId" };
    }

    // Build where clause for user roles
    const where: any = { bankId };

    // Add role filter if provided
    if (options.role && options.role !== "all") {
      where.role = options.role;
    }

    // Exclude applicants by default
    where.role = { not: "APPLICANT" };

    // Query user roles
    const userRoles = await prisma.userRoles.findMany({
      where,
      include: {
        user: true,
      },
    });

    // Transform to user records
    const users = userRoles.map(
      (userRole): UserRecord => ({
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
      }),
    );

    // Apply additional filtering that can't be done at DB level
    let filteredUsers = [...users];

    // Apply status filter if provided
    if (options.status && options.status !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.status === options.status);
    }

    // Apply search filter if provided
    if (options.search) {
      const search = options.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search),
      );
    }

    return {
      success: true,
      message: "Users fetched successfully",
      data: filteredUsers,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: "errors.fetchFailed",
      errors: { root: "Failed to fetch users" },
    };
  }
}
