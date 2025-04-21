import { AppAbility } from "@/lib/casl/types";

/**
 * Defines visibility and editability of Guarantor fields based on the user's CASL ability
 *
 * @param {AppAbility} ability - The CASL ability instance with user permissions
 * @returns {GuarantorFieldVisibility} Object with boolean flags for field visibility and editability
 */
export function defineGuarantorFieldVisibility(ability: AppAbility) {
  const canReadGuarantor = ability.can("read", "Guarantor");
  const canUpdateGuarantor = ability.can("update", "Guarantor");
  const canManageGuarantor = ability.can("manage", "Guarantor");

  console.log("Can read guarantor:", canReadGuarantor);
  console.log("Can update guarantor:", canUpdateGuarantor);
  console.log("Can update guarantor:", canManageGuarantor);

  return {
    // Read permissions - use the overall permission
    id: canReadGuarantor,
    firstName: canReadGuarantor,
    lastName: canReadGuarantor,
    email: canReadGuarantor,
    addressState: canReadGuarantor,
    addressCity: canReadGuarantor,
    addressZipCode: canReadGuarantor,
    addressLine1: canReadGuarantor,
    addressLine2: canReadGuarantor,
    mobileNumber: canReadGuarantor,
    loanApplicationId: canReadGuarantor,
    createdAt: canReadGuarantor,
    updatedAt: canReadGuarantor,
    deletedAt: canReadGuarantor,

    // Update permissions - use the overall permission
    canUpdateFirstName: canUpdateGuarantor,
    canUpdateLastName: canUpdateGuarantor,
    canUpdateEmail: canUpdateGuarantor,
    canUpdateAddressState: canUpdateGuarantor,
    canUpdateAddressCity: canUpdateGuarantor,
    canUpdateAddressZipCode: canUpdateGuarantor,
    canUpdateAddressLine1: canUpdateGuarantor,
    canUpdateAddressLine2: canUpdateGuarantor,
    canUpdateMobileNumber: canUpdateGuarantor,

    // Action permissions
    canCreate: ability.can("create", "Guarantor"),
    canUpdate: canUpdateGuarantor,
    canDelete: ability.can("delete", "Guarantor"),
  };
}

/**
 * Type definition for the object returned by defineGuarantorFieldVisibility
 */
export type GuarantorFieldVisibility = ReturnType<typeof defineGuarantorFieldVisibility>;
