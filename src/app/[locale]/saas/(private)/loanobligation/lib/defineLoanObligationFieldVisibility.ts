import { AppAbility } from "@/lib/casl/types";

/**
 * Defines field-level visibility and permissions for the LoanObligation model
 * based on the user's CASL ability
 *
 * @param ability - The CASL ability instance for the current user
 * @returns An object with field visibility flags and permission checks
 */
export function defineLoanObligationFieldVisibility(ability: AppAbility) {
  // Define which fields are visible based on user permissions
  const canViewCibilScore = ability.can("read", "LoanObligation", "cibilScore");
  const canViewTotalLoan = ability.can("read", "LoanObligation", "totalLoan");
  const canViewTotalEmi = ability.can("read", "LoanObligation", "totalEmi");

  // Define which fields are editable based on user permissions
  const canEditCibilScore = ability.can("update", "LoanObligation", "cibilScore");
  const canEditLoanDetails = ability.can("update", "LoanObligationDetail");

  // Define which actions are allowed based on user permissions
  const canCreateLoanObligation = ability.can("create", "LoanObligation");
  const canDeleteLoanObligation = ability.can("delete", "LoanObligation");
  const canCreateLoanObligationDetail = ability.can("create", "LoanObligationDetail");
  const canDeleteLoanObligationDetail = ability.can("delete", "LoanObligationDetail");

  return {
    // Field visibility
    fields: {
      cibilScore: {
        visible: canViewCibilScore,
        editable: canEditCibilScore,
      },
      totalLoan: {
        visible: canViewTotalLoan,
        editable: false, // Calculated field, not directly editable
      },
      totalEmi: {
        visible: canViewTotalEmi,
        editable: false, // Calculated field, not directly editable
      },
      loanDetails: {
        visible: true, // Always visible if the user can access the page
        editable: canEditLoanDetails,
      },
    },

    // Action permissions
    actions: {
      createLoanObligation: canCreateLoanObligation,
      deleteLoanObligation: canDeleteLoanObligation,
      createLoanObligationDetail: canCreateLoanObligationDetail,
      deleteLoanObligationDetail: canDeleteLoanObligationDetail,
      addLoanDetail: canCreateLoanObligationDetail,
      removeLoanDetail: canDeleteLoanObligationDetail,
    },

    // Helper function to check if a specific loan detail field is editable
    isLoanDetailFieldEditable: (fieldName: string) => {
      return ability.can("update", "LoanObligationDetail", fieldName);
    },
  };
}
