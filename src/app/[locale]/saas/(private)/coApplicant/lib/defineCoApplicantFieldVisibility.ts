import { AppAbility } from "@/lib/casl/types";

/**
 * Defines the field visibility for CoApplicant model based on user's CASL ability
 *
 * @param {AppAbility} ability - The CASL ability instance for the current user
 * @returns {CoApplicantFieldVisibility} Object with boolean flags for field visibility and permissions
 */
export function defineCoApplicantFieldVisibility(ability: AppAbility) {
  const canReadCoApplicant = ability.can("read", "CoApplicant");
  const canUpdateCoApplicant = ability.can("update", "CoApplicant");

  return {
    // Read permissions for fields
    id: canReadCoApplicant,
    firstName: canReadCoApplicant,
    lastName: canReadCoApplicant,
    email: canReadCoApplicant,
    addressState: canReadCoApplicant,
    addressCity: canReadCoApplicant,
    addressZipCode: canReadCoApplicant,
    addressLine1: canReadCoApplicant,
    addressLine2: canReadCoApplicant,
    mobileNumber: canReadCoApplicant,
    createdAt: canReadCoApplicant,
    updatedAt: canReadCoApplicant,
    loanApplicationId: canReadCoApplicant,

    // Write permissions for fields
    canUpdateFirstName: canUpdateCoApplicant,
    canUpdateLastName: canUpdateCoApplicant,
    canUpdateEmail: canUpdateCoApplicant,
    canUpdateAddressState: canUpdateCoApplicant,
    canUpdateAddressCity: canUpdateCoApplicant,
    canUpdateAddressZipCode: canUpdateCoApplicant,
    canUpdateAddressLine1: canUpdateCoApplicant,
    canUpdateAddressLine2: canUpdateCoApplicant,
    canUpdateMobileNumber: canUpdateCoApplicant,
    canUpdateLoanApplicationId: canUpdateCoApplicant,

    // Action permissions
    canCreate: ability.can("create", "CoApplicant"),
    canUpdate: canUpdateCoApplicant,
    canDelete: ability.can("delete", "CoApplicant"),
    canView: canReadCoApplicant,
  };
}

/**
 * Type definition for the object returned by defineCoApplicantFieldVisibility
 */
export type CoApplicantFieldVisibility = ReturnType<typeof defineCoApplicantFieldVisibility>;
