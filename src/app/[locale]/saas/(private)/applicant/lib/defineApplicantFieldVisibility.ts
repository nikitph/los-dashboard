import { AppAbility } from "@/lib/casl/types";

/**
 * Defines the visibility of Applicant fields based on user's CASL abilities
 *
 * @param ability - The CASL AppAbility instance for the current user
 * @returns An object mapping field names to boolean visibility flags
 */
export function defineApplicantFieldVisibility(ability: AppAbility) {
  return {
    // Basic fields
    id: ability.can("read", "Applicant", "id"),
    userId: ability.can("read", "Applicant", "userId"),
    createdAt: ability.can("read", "Applicant", "createdAt"),
    updatedAt: ability.can("read", "Applicant", "updatedAt"),

    // Personal information
    dateOfBirth: ability.can("read", "Applicant", "dateOfBirth"),
    photoUrl: ability.can("read", "Applicant", "photoUrl"),

    // Address fields
    addressState: ability.can("read", "Applicant", "addressState"),
    addressCity: ability.can("read", "Applicant", "addressCity"),
    addressFull: ability.can("read", "Applicant", "addressFull"),
    addressPinCode: ability.can("read", "Applicant", "addressPinCode"),

    // Verification fields
    aadharNumber: ability.can("read", "Applicant", "aadharNumber"),
    panNumber: ability.can("read", "Applicant", "panNumber"),
    aadharVerificationStatus: ability.can("read", "Applicant", "aadharVerificationStatus"),
    panVerificationStatus: ability.can("read", "Applicant", "panVerificationStatus"),

    // Bank relationship
    bankId: ability.can("read", "Applicant", "bankId"),

    // Related entities
    dependents: ability.can("read", "Applicant", "dependents"),
    documents: ability.can("read", "Applicant", "documents"),
    incomes: ability.can("read", "Applicant", "incomes"),
    loanApplications: ability.can("read", "Applicant", "loanApplications"),
    loanObligations: ability.can("read", "Applicant", "loanObligations"),

    // Derived fields
    fullAddress:
      ability.can("read", "Applicant", "addressFull") ||
      ability.can("read", "Applicant", "addressCity") ||
      ability.can("read", "Applicant", "addressState"),
    verificationStatus:
      ability.can("read", "Applicant", "aadharVerificationStatus") ||
      ability.can("read", "Applicant", "panVerificationStatus"),

    // Update permissions
    canUpdateDateOfBirth: ability.can("update", "Applicant", "dateOfBirth"),
    canUpdateAddressState: ability.can("update", "Applicant", "addressState"),
    canUpdateAddressCity: ability.can("update", "Applicant", "addressCity"),
    canUpdateAddressFull: ability.can("update", "Applicant", "addressFull"),
    canUpdateAddressPinCode: ability.can("update", "Applicant", "addressPinCode"),
    canUpdateAadharNumber: ability.can("update", "Applicant", "aadharNumber"),
    canUpdatePanNumber: ability.can("update", "Applicant", "panNumber"),
    canUpdateAadharVerificationStatus: ability.can("update", "Applicant", "aadharVerificationStatus"),
    canUpdatePanVerificationStatus: ability.can("update", "Applicant", "panVerificationStatus"),
    canUpdatePhotoUrl: ability.can("update", "Applicant", "photoUrl"),

    // Delete permissions
    canDelete: ability.can("delete", "Applicant"),

    // Create permissions for related entities
    canCreateDependent: ability.can("create", "Dependent"),
    canCreateDocument: ability.can("create", "Document"),
    canCreateIncome: ability.can("create", "Income"),
    canCreateLoanApplication: ability.can("create", "LoanApplication"),
    canCreateLoanObligation: ability.can("create", "LoanObligation"),
  };
}

export type ApplicantFieldVisibility = ReturnType<typeof defineApplicantFieldVisibility>;
