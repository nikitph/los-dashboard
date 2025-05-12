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

  // Field-level read permissions
  const canReadStatus = ability.can("read", "LoanApplication", "status");
  const canReadAmountRequested = ability.can("read", "LoanApplication", "amountRequested");
  const canReadTenure = ability.can("read", "LoanApplication", "selectedTenure");
  const canReadEMI = ability.can("read", "LoanApplication", "calculatedEMI");
  const canReadCreatedAt = ability.can("read", "LoanApplication", "createdAt");
  const canReadLoanType = ability.can("read", "LoanApplication", "loanType");

  // Related entity read permissions
  const canReadApplicant = ability.can("read", "Applicant");
  const canReadCoApplicants = ability.can("read", "CoApplicant");
  const canReadGuarantors = ability.can("read", "Guarantor");
  const canReadDocuments = ability.can("read", "Document");
  const canReadVerifications = ability.can("read", "Verification");
  const canReadTimelineEvents = ability.can("read", "TimelineEvent");

  // Create permissions for related entities
  const canCreateCoApplicant = ability.can("create", "CoApplicant");
  const canCreateGuarantor = ability.can("create", "Guarantor");
  const canCreateDocument = ability.can("create", "Document");
  const canCreateVerification = ability.can("create", "Verification");

  return {
    // Basic permissions
    id: canReadLoanApplication,
    applicantId: canReadLoanApplication,
    bankId: canReadLoanApplication,

    // Field-level read permissions
    loanType: canReadLoanType && canReadLoanApplication,
    amountRequested: canReadAmountRequested && canReadLoanApplication,
    selectedTenure: canReadTenure && canReadLoanApplication,
    calculatedEMI: canReadEMI && canReadLoanApplication,
    status: canReadStatus && canReadLoanApplication,
    createdAt: canReadCreatedAt && canReadLoanApplication,
    updatedAt: canReadLoanApplication,
    deletedAt: canReadLoanApplication,

    // Related entity visibility
    applicant: canReadApplicant,
    guarantors: canReadGuarantors,
    coApplicants: canReadCoApplicants,
    verifications: canReadVerifications,
    documents: canReadDocuments,
    timelineEvents: canReadTimelineEvents,

    // Update field permissions
    canUpdateApplicantId: ability.can("update", "LoanApplication", "applicantId"),
    canUpdateBankId: ability.can("update", "LoanApplication", "bankId"),
    canUpdateLoanType: ability.can("update", "LoanApplication", "loanType"),
    canUpdateAmountRequested: ability.can("update", "LoanApplication", "amountRequested"),
    canUpdateStatus: ability.can("update", "LoanApplication", "status"),
    canUpdateSelectedTenure: ability.can("update", "LoanApplication", "selectedTenure"),

    // General action permissions
    canCreate: ability.can("create", "LoanApplication"),
    canUpdate: canUpdateLoanApplication,
    canDelete: ability.can("delete", "LoanApplication"),

    // Related entity actions
    canAddGuarantor: canCreateGuarantor,
    canAddCoApplicant: canCreateCoApplicant,
    canAddVerification: canCreateVerification,
    canAddDocument: canCreateDocument,
  };
}

/**
 * Type definition for the object returned by defineLoanApplicationFieldVisibility
 */
export type LoanApplicationFieldVisibility = ReturnType<typeof defineLoanApplicationFieldVisibility>;
