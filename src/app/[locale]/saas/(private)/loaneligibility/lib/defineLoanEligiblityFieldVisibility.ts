import { AppAbility } from "@/lib/casl/types";

/**
 * Defines which fields of the LoanEligibility model are visible or editable
 * based on the user's permissions defined in CASL abilities
 *
 * @param {AppAbility} ability - The CASL ability instance from @/lib/casl
 * @returns {LoanEligibilityFieldVisibility} Object with boolean flags for each field visibility
 */
export function defineLoanEligibilityFieldVisibility(ability: AppAbility) {
  return {
    // Read permissions
    eligibleLoanAmount: ability.can("read", "LoanApplication", "eligibleLoanAmount"),
    proposedAmount: ability.can("read", "LoanApplication", "proposedAmount"),
    selectedTenure: ability.can("read", "LoanApplication", "selectedTenure"),
    calculatedEMI: ability.can("read", "LoanApplication", "calculatedEMI"),
    loanApplicationDetails: ability.can("read", "LoanApplication", "details"),

    // Update permissions
    canUpdateProposedAmount: ability.can("update", "LoanApplication", "proposedAmount"),
    canUpdateSelectedTenure: ability.can("update", "LoanApplication", "selectedTenure"),
    canUpdateCalculatedEMI: ability.can("update", "LoanApplication", "calculatedEMI"),

    // Action permissions
    canProceed: ability.can("update", "LoanApplication", "status"),
    canDecline: ability.can("update", "LoanApplication", "status"),
  };
}

export type LoanEligibilityFieldVisibility = ReturnType<typeof defineLoanEligibilityFieldVisibility>;
