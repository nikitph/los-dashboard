import { AppAbility } from "@/lib/casl/types";

/**
 * Defines which fields of the LoanConfirmation model are visible or editable
 * based on the user's permissions defined in CASL abilities
 *
 * @param {AppAbility} ability - The CASL ability instance from @/lib/casl
 * @returns {LoanConfirmationFieldVisibility} Object with boolean flags for each field visibility
 */
export function defineLoanConfirmationFieldVisibility(ability: AppAbility) {
  return {
    // Read permissions
    loanType: ability.can("read", "LoanApplication", "loanType"),
    proposedAmount: ability.can("read", "LoanApplication", "proposedAmount"),
    calculatedEMI: ability.can("read", "LoanApplication", "calculatedEMI"),
    selectedTenure: ability.can("read", "LoanApplication", "selectedTenure"),
    amountRequested: ability.can("read", "LoanApplication", "amountRequested"),
    remark: ability.can("read", "LoanApplication", "remark"),
    status: ability.can("read", "LoanApplication", "status"),

    // Update permissions
    canUpdateRemark: ability.can("update", "LoanApplication", "remark"),
    canUpdateStatus: ability.can("update", "LoanApplication", "status"),

    // Action permissions
    canProceedToInspection: ability.can("update", "LoanApplication", "status"),
    canSendToLoanOfficer: ability.can("update", "LoanApplication", "status"),
    canFinishApplication: ability.can("update", "LoanApplication", "status"),
  };
}

export type LoanConfirmationFieldVisibility = ReturnType<typeof defineLoanConfirmationFieldVisibility>;
