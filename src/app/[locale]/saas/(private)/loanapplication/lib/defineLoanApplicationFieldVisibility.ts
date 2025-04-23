import { AppAbility } from "@/lib/casl/types";

/**
 * Defines visibility and editability of LoanApplication fields based on the user's CASL ability
 *
 * @param {AppAbility} ability - The CASL ability instance with user permissions
 * @returns {LoanApplicationFieldVisibility} Object with boolean flags for field visibility and editability
 */
export function defineLoanApplicationFieldVisibility(ability: AppAbility) {
  const canReadLoanApplication = ability.can("read", "LoanApplication");
  const canUpdateLoanApplication = ability.can("update", "LoanApplication");

  return {
    // Read permissions - use the overall permission
    id: canReadLoanApplication,
    applicantId: canReadLoanApplication,
    bankId: canReadLoanApplication,
    loanType: canReadLoanApplication,
    amountRequested: canReadLoanApplication,
    status: canReadLoanApplication,
    createdAt: canReadLoanApplication,
    updatedAt: canReadLoanApplication,
    deletedAt: canReadLoanApplication,

    // Related entities
    applicant: canReadLoanApplication,
    guarantors: canReadLoanApplication,
    coApplicants: canReadLoanApplication,
    verifications: canReadLoanApplication,
    documents: canReadLoanApplication,

    // Update permissions - use the overall permission
    canUpdateApplicantId: canUpdateLoanApplication,
    canUpdateBankId: canUpdateLoanApplication,
    canUpdateLoanType: canUpdateLoanApplication,
    canUpdateAmountRequested: canUpdateLoanApplication,
    canUpdateStatus: canUpdateLoanApplication,

    // Action permissions
    canCreate: ability.can("create", "LoanApplication"),
    canUpdate: canUpdateLoanApplication,
    canDelete: ability.can("delete", "LoanApplication"),

    // Related entity actions
    canAddGuarantor: ability.can("create", "Guarantor"),
    canAddCoApplicant: ability.can("create", "CoApplicant"),
    canAddVerification: ability.can("create", "Verification"),
    canAddDocument: ability.can("create", "Document"),
  };
}

/**
 * Type definition for the object returned by defineLoanApplicationFieldVisibility
 */
export type LoanApplicationFieldVisibility = ReturnType<typeof defineLoanApplicationFieldVisibility>;
