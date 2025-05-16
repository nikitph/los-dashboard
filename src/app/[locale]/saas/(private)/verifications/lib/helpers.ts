import { format } from "date-fns";
import {
  BusinessVerificationView,
  PropertyVerificationView,
  ResidenceVerificationView,
  VehicleVerificationView,
  VerificationView
} from "../../verifications/schemas/verificationSchema";

/**
 * Formats a verification date in a readable format
 *
 * @param {Date} date - The verification date to format
 * @returns {string} The formatted date string
 */
export function formatVerificationDate(date: Date): string {
  return format(date, "PPP"); // Locale-aware date format
}

/**
 * Returns a display string for the verification status
 *
 * @param {string} status - The verification status (PENDING, COMPLETED, FAILED)
 * @returns {string} User-friendly status display
 */
export function formatVerificationStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

/**
 * Returns a display string for the verification type
 *
 * @param {string} type - The verification type (RESIDENCE, BUSINESS, VEHICLE, PROPERTY)
 * @returns {string} User-friendly type display
 */
export function formatVerificationType(type: string): string {
  switch (type) {
    case "RESIDENCE":
      return "Residence";
    case "BUSINESS":
      return "Business";
    case "VEHICLE":
      return "Vehicle";
    case "PROPERTY":
      return "Property";
    default:
      return type;
  }
}

/**
 * Formats a person's full name by combining first and last name
 *
 * @param {string} firstName - The person's first name
 * @param {string} lastName - The person's last name
 * @returns {string} The formatted full name
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Formats a full address from individual address components
 *
 * @param {object} address - The address components
 * @param {string} address.addressLine1 - The first line of the address
 * @param {string | null | undefined} address.addressLine2 - The second line of the address (optional)
 * @param {string} address.addressCity - The city
 * @param {string} address.addressState - The state
 * @param {string} address.addressZipCode - The ZIP code
 * @returns {string} The formatted full address
 */
export function formatFullAddress({
  addressLine1,
  addressLine2,
  addressCity,
  addressState,
  addressZipCode,
}: {
  addressLine1: string;
  addressLine2?: string | null;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}): string {
  const line2 = addressLine2 ? `${addressLine2}, ` : "";
  return `${addressLine1}, ${line2}${addressCity}, ${addressState} ${addressZipCode}`.replace(/, ,/g, ",");
}

/**
 * Returns a display string for the residence type
 *
 * @param {string} residenceType - The residence type (OWNED, RENTED)
 * @returns {string} User-friendly residence type display
 */
export function formatResidenceType(residenceType: string): string {
  switch (residenceType) {
    case "OWNED":
      return "Owned";
    case "RENTED":
      return "Rented";
    default:
      return residenceType;
  }
}

/**
 * Returns a display string for the structure type
 *
 * @param {string} structureType - The structure type (DUPLEX, APARTMENT, BUNGALOW)
 * @returns {string} User-friendly structure type display
 */
export function formatStructureType(structureType: string): string {
  switch (structureType) {
    case "DUPLEX":
      return "Duplex";
    case "APARTMENT":
      return "Apartment";
    case "BUNGALOW":
      return "Bungalow";
    default:
      return structureType;
  }
}

/**
 * Formats a vehicle description from make and model
 *
 * @param {string} make - The vehicle make
 * @param {string} model - The vehicle model
 * @param {string | null | undefined} vehicleType - The vehicle type (optional)
 * @returns {string} Formatted vehicle description
 */
export function formatVehicleDescription(make: string, model: string, vehicleType?: string | null): string {
  return vehicleType ? `${make} ${model} (${vehicleType})` : `${make} ${model}`;
}

/**
 * Transforms a verification data object into a view model with derived fields
 *
 * @param {any} verification - The raw verification data
 * @returns {VerificationView} The verification view model with derived fields
 */
export function transformToVerificationView(verification: any): VerificationView {
  return {
    ...verification,
    formattedVerificationDate: formatVerificationDate(verification.verificationDate),
    statusDisplay: formatVerificationStatus(verification.status),
    typeDisplay: formatVerificationType(verification.type),
    verifierName: verification.verifiedBy
      ? formatFullName(verification.verifiedBy.firstName, verification.verifiedBy.lastName)
      : undefined,
  };
}

/**
 * Transforms a residence verification data object into a view model with derived fields
 *
 * @param {any} residenceVerification - The raw residence verification data
 * @returns {ResidenceVerificationView} The residence verification view model with derived fields
 */
export function transformToResidenceVerificationView(residenceVerification: any): ResidenceVerificationView {
  return {
    ...residenceVerification,
    fullName: formatFullName(residenceVerification.ownerFirstName, residenceVerification.ownerLastName),
    fullAddress: formatFullAddress({
      addressLine1: residenceVerification.addressLine1,
      addressLine2: residenceVerification.addressLine2,
      addressCity: residenceVerification.addressCity,
      addressState: residenceVerification.addressState,
      addressZipCode: residenceVerification.addressZipCode,
    }),
    residenceTypeDisplay: formatResidenceType(residenceVerification.residenceType),
    structureTypeDisplay: formatStructureType(residenceVerification.structureType),
  };
}

/**
 * Transforms a business verification data object into a view model with derived fields
 *
 * @param {any} businessVerification - The raw business verification data
 * @returns {BusinessVerificationView} The business verification view model with derived fields
 */
export function transformToBusinessVerificationView(businessVerification: any): BusinessVerificationView {
  return {
    ...businessVerification,
    fullAddress: formatFullAddress({
      addressLine1: businessVerification.addressLine1,
      addressLine2: businessVerification.addressLine2,
      addressCity: businessVerification.addressCity,
      addressState: businessVerification.addressState,
      addressZipCode: businessVerification.addressZipCode,
    }),
  };
}

/**
 * Transforms a property verification data object into a view model with derived fields
 *
 * @param {any} propertyVerification - The raw property verification data
 * @returns {PropertyVerificationView} The property verification view model with derived fields
 */
export function transformToPropertyVerificationView(propertyVerification: any): PropertyVerificationView {
  return {
    ...propertyVerification,
    fullName: formatFullName(propertyVerification.ownerFirstName, propertyVerification.ownerLastName),
    fullAddress: formatFullAddress({
      addressLine1: propertyVerification.addressLine1,
      addressLine2: propertyVerification.addressLine2,
      addressCity: propertyVerification.addressCity,
      addressState: propertyVerification.addressState,
      addressZipCode: propertyVerification.addressZipCode,
    }),
  };
}

/**
 * Transforms a vehicle verification data object into a view model with derived fields
 *
 * @param {any} vehicleVerification - The raw vehicle verification data
 * @returns {VehicleVerificationView} The vehicle verification view model with derived fields
 */
export function transformToVehicleVerificationView(vehicleVerification: any): VehicleVerificationView {
  return {
    ...vehicleVerification,
    vehicleDescription: formatVehicleDescription(
      vehicleVerification.make,
      vehicleVerification.model,
      vehicleVerification.vehicleType,
    ),
  };
}

/**
 * Transforms raw verification data into a complete view model with all related verification types
 *
 * @param {any} data - The raw verification data with related verification types
 * @returns {object} Complete verification view model with derived fields
 */
export function transformToFullVerificationView(data: any) {
  const verification = transformToVerificationView(data);

  // Initialize with base verification
  const result: any = { verification };

  // Add specific verification types as needed
  if (data.residenceVerification) {
    result.residenceVerification = transformToResidenceVerificationView(data.residenceVerification);
  }

  if (data.businessVerification) {
    result.businessVerification = transformToBusinessVerificationView(data.businessVerification);
  }

  if (data.propertyVerification) {
    result.propertyVerification = transformToPropertyVerificationView(data.propertyVerification);
  }

  if (data.vehicleVerification) {
    result.vehicleVerification = transformToVehicleVerificationView(data.vehicleVerification);
  }

  return result;
}
