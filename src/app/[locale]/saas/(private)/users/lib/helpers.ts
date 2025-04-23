import { UserRecord, UserView } from "../schemas/userSchema";

/**
 * Formats a user's full name by combining first and last name
 *
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {string} Formatted full name
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Transforms a user record to a view model with derived fields
 *
 * @param {UserRecord} user - The user record from database/API
 * @returns {UserView} User view with derived fields
 */
export function transformToUserView(user: UserRecord): UserView {
  return {
    ...user,
    fullName: formatFullName(user.firstName, user.lastName),
    phoneNumber: user.phoneNumber || null,
    avatarUrl: user.avatarUrl || null,
    createdAt: undefined, // This would normally come from the database
    updatedAt: undefined, // This would normally come from the database
  };
}

/**
 * Gets status color variant for UI display
 *
 * @param {string} status - The user status
 * @returns {string} CSS variant for the status badge
 */
export function getUserStatusVariant(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "locked":
      return "destructive";
    default:
      return "secondary";
  }
}

/**
 * Gets role display name for UI
 *
 * @param {string} role - The role code
 * @returns {string} Human-readable role name
 */
export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    BANK_ADMIN: "Bank Admin",
    LOAN_OFFICER: "Loan Officer",
    CLERK: "Clerk",
    INSPECTOR: "Inspector",
    CEO: "CEO",
    LOAN_COMMITTEE: "Loan Committee",
    BOARD: "Board Member",
    SAAS_ADMIN: "System Admin",
    APPLICANT: "Applicant",
    USER: "User",
  };

  return roleMap[role] || role;
}
