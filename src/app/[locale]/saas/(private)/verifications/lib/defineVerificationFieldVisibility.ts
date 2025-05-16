import { AppAbility } from "@/lib/casl/types";

/**
 * Defines visibility and editability of Verification fields based on the user's CASL ability
 *
 * @param {AppAbility} ability - The CASL ability instance with user permissions
 * @returns {VerificationFieldVisibility} Object with boolean flags for field visibility and editability
 */
export function defineVerificationFieldVisibility(ability: AppAbility) {
  const canReadVerification = ability.can("read", "Verification");
  const canUpdateVerification = ability.can("update", "Verification");
  const canManageVerification = ability.can("manage", "Verification");

  // Base verification fields
  const visibilityMap = {
    // Read permissions for base verification
    id: canReadVerification,
    loanApplicationId: canReadVerification,
    type: canReadVerification,
    status: canReadVerification,
    verifiedById: canReadVerification,
    deletedAt: canReadVerification,
    createdAt: canReadVerification,
    remarks: canReadVerification,
    result: canReadVerification,
    updatedAt: canReadVerification,
    verificationDate: canReadVerification,
    verificationTime: canReadVerification,

    // Read permissions for residence verification
    ownerFirstName: canReadVerification,
    ownerLastName: canReadVerification,
    residentSince: canReadVerification,
    residenceType: canReadVerification,
    structureType: canReadVerification,
    
    // Read permissions for business verification
    businessName: canReadVerification,
    businessType: canReadVerification,
    contactDetails: canReadVerification,
    businessExistence: canReadVerification,
    natureOfBusiness: canReadVerification,
    salesPerDay: canReadVerification,
    
    // Read permissions for property verification
    // (Property owner fields already covered above)
    
    // Read permissions for vehicle verification
    make: canReadVerification,
    model: canReadVerification,
    engineNumber: canReadVerification,
    chassisNumber: canReadVerification,
    registrationNumber: canReadVerification,
    vehicleType: canReadVerification,
    
    // Shared address fields for all verification types
    addressCity: canReadVerification,
    addressLine1: canReadVerification,
    addressLine2: canReadVerification,
    addressState: canReadVerification,
    addressZipCode: canReadVerification,
    locationFromMain: canReadVerification,

    // Update permissions - base verification fields
    canUpdateType: canUpdateVerification,
    canUpdateStatus: canUpdateVerification,
    canUpdateVerifiedById: canUpdateVerification,
    canUpdateRemarks: canUpdateVerification,
    canUpdateResult: canUpdateVerification,
    canUpdateVerificationDate: canUpdateVerification,
    canUpdateVerificationTime: canUpdateVerification,
    
    // Update permissions - residence verification fields
    canUpdateOwnerFirstName: canUpdateVerification,
    canUpdateOwnerLastName: canUpdateVerification,
    canUpdateResidentSince: canUpdateVerification,
    canUpdateResidenceType: canUpdateVerification,
    canUpdateStructureType: canUpdateVerification,
    
    // Update permissions - business verification fields
    canUpdateBusinessName: canUpdateVerification,
    canUpdateBusinessType: canUpdateVerification,
    canUpdateContactDetails: canUpdateVerification,
    canUpdateBusinessExistence: canUpdateVerification,
    canUpdateNatureOfBusiness: canUpdateVerification,
    canUpdateSalesPerDay: canUpdateVerification,
    
    // Update permissions - vehicle verification fields
    canUpdateMake: canUpdateVerification,
    canUpdateModel: canUpdateVerification, 
    canUpdateEngineNumber: canUpdateVerification,
    canUpdateChassisNumber: canUpdateVerification,
    canUpdateRegistrationNumber: canUpdateVerification,
    canUpdateVehicleType: canUpdateVerification,
    
    // Update permissions - shared address fields
    canUpdateAddressCity: canUpdateVerification,
    canUpdateAddressLine1: canUpdateVerification,
    canUpdateAddressLine2: canUpdateVerification,
    canUpdateAddressState: canUpdateVerification,
    canUpdateAddressZipCode: canUpdateVerification,
    canUpdateLocationFromMain: canUpdateVerification,

    // Action permissions
    canCreate: ability.can("create", "Verification"),
    canUpdate: canUpdateVerification,
    canDelete: ability.can("delete", "Verification"),
    canApprove: ability.can("update", "Verification"),
    canReject: ability.can("update", "Verification"),
    canAssign: ability.can("update", "Verification"),
  };

  return visibilityMap;
}

/**
 * Type definition for the object returned by defineVerificationFieldVisibility
 */
export type VerificationFieldVisibility = ReturnType<typeof defineVerificationFieldVisibility>; 