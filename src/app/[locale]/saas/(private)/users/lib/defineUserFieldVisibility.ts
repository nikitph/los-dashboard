import { AppAbility } from "@/lib/casl/types";

/**
 * Defines visibility and editability of User fields based on the user's CASL ability
 *
 * @param {AppAbility} ability - The CASL ability instance with user permissions
 * @returns {UserFieldVisibility} Object with boolean flags for field visibility and editability
 */
export function defineUserFieldVisibility(ability: AppAbility) {
  const canReadUserProfile = ability.can("read", "UserProfile");
  const canUpdateUserProfile = ability.can("update", "UserProfile");
  const canManageUserProfile = ability.can("manage", "UserProfile");

  return {
    // Read permissions
    id: canReadUserProfile,
    firstName: canReadUserProfile,
    lastName: canReadUserProfile,
    email: canReadUserProfile,
    phoneNumber: canReadUserProfile,
    role: canReadUserProfile,
    status: canReadUserProfile,
    lastLogin: canReadUserProfile,
    branch: canReadUserProfile,
    avatarUrl: canReadUserProfile,
    createdAt: canReadUserProfile,
    updatedAt: canReadUserProfile,

    // Update permissions
    canUpdateFirstName: canUpdateUserProfile,
    canUpdateLastName: canUpdateUserProfile,
    canUpdateEmail: canUpdateUserProfile,
    canUpdatePhoneNumber: canUpdateUserProfile,
    canUpdateRole: canUpdateUserProfile || canManageUserProfile,
    canUpdateStatus: canUpdateUserProfile || canManageUserProfile,

    // Action permissions
    canCreate: ability.can("create", "UserProfile"),
    canUpdate: canUpdateUserProfile,
    canDelete: ability.can("delete", "UserProfile"),
    canResetPassword: canUpdateUserProfile || canManageUserProfile,
    canLockUnlock: canUpdateUserProfile || canManageUserProfile,
    canApprove: canManageUserProfile,
    canReject: canManageUserProfile,
  };
}

/**
 * Type definition for the object returned by defineUserFieldVisibility
 */
export type UserFieldVisibility = ReturnType<typeof defineUserFieldVisibility>;
