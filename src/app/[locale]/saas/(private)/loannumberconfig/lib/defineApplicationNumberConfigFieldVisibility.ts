import { AppAbility } from "@/lib/casl/types";

/**
 * Interface defining field visibility for Application Number Configuration
 */
export interface ApplicationNumberConfigFieldVisibility {
  // Basic configuration fields
  separator: boolean;
  includePrefix: boolean;
  includeBranch: boolean;
  includeLoanType: boolean;
  includeDate: boolean;

  // Settings fields
  bankName: boolean;
  branchNumber: boolean;
  loanTypeCode: boolean;
  serialNumberPadding: boolean;

  // Update permissions
  canUpdateSeparator: boolean;
  canUpdateIncludePrefix: boolean;
  canUpdateIncludeBranch: boolean;
  canUpdateIncludeLoanType: boolean;
  canUpdateIncludeDate: boolean;
  canUpdateBankName: boolean;
  canUpdateBranchNumber: boolean;
  canUpdateLoanTypeCode: boolean;
  canUpdateSerialNumberPadding: boolean;

  // Actions
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canView: boolean;
}

/**
 * Defines field visibility for Application Number Configuration based on user abilities
 *
 * This function uses CASL permissions to determine which fields a user can view
 * and edit for application number configurations. It provides granular control
 * over field access based on the user's role and permissions.
 *
 * @param ability - CASL ability instance containing user permissions
 * @returns Object mapping field names to visibility boolean values
 */
export function defineApplicationNumberConfigFieldVisibility(
  ability: AppAbility,
): ApplicationNumberConfigFieldVisibility {
  return {
    // Read permissions for basic configuration fields
    separator: ability.can("read", "ApplicationNumberConfiguration", "separator"),
    includePrefix: ability.can("read", "ApplicationNumberConfiguration", "includePrefix"),
    includeBranch: ability.can("read", "ApplicationNumberConfiguration", "includeBranch"),
    includeLoanType: ability.can("read", "ApplicationNumberConfiguration", "includeLoanType"),
    includeDate: ability.can("read", "ApplicationNumberConfiguration", "includeDate"),

    // Read permissions for settings fields
    bankName: ability.can("read", "ApplicationNumberConfiguration", "bankName"),
    branchNumber: ability.can("read", "ApplicationNumberConfiguration", "branchNumber"),
    loanTypeCode: ability.can("read", "ApplicationNumberConfiguration", "loanTypeCode"),
    serialNumberPadding: ability.can("read", "ApplicationNumberConfiguration", "serialNumberPadding"),

    // Update permissions for basic configuration fields
    canUpdateSeparator: ability.can("update", "ApplicationNumberConfiguration", "separator"),
    canUpdateIncludePrefix: ability.can("update", "ApplicationNumberConfiguration", "includePrefix"),
    canUpdateIncludeBranch: ability.can("update", "ApplicationNumberConfiguration", "includeBranch"),
    canUpdateIncludeLoanType: ability.can("update", "ApplicationNumberConfiguration", "includeLoanType"),
    canUpdateIncludeDate: ability.can("update", "ApplicationNumberConfiguration", "includeDate"),

    // Update permissions for settings fields
    canUpdateBankName: ability.can("update", "ApplicationNumberConfiguration", "bankName"),
    canUpdateBranchNumber: ability.can("update", "ApplicationNumberConfiguration", "branchNumber"),
    canUpdateLoanTypeCode: ability.can("update", "ApplicationNumberConfiguration", "loanTypeCode"),
    canUpdateSerialNumberPadding: ability.can("update", "ApplicationNumberConfiguration", "serialNumberPadding"),

    // Action permissions
    canCreate: ability.can("create", "ApplicationNumberConfiguration"),
    canUpdate: ability.can("update", "ApplicationNumberConfiguration"),
    canDelete: ability.can("delete", "ApplicationNumberConfiguration"),
    canView: ability.can("read", "ApplicationNumberConfiguration"),
  };
}
