/**
 * Helper functions for the CoApplicant module
 */

/**
 * Formats a full name from first and last name
 * 
 * @param {string} firstName - The first name
 * @param {string} lastName - The last name
 * @returns {string} The formatted full name
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Formats a complete address from address components
 * 
 * @param {object} address - The address components
 * @param {string} address.addressLine1 - Address line 1
 * @param {string} [address.addressLine2] - Optional address line 2
 * @param {string} address.addressCity - City
 * @param {string} address.addressState - State
 * @param {string} address.addressZipCode - ZIP code
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
  const line2 = addressLine2 ? `${addressLine2}, ` : '';
  return `${addressLine1}, ${line2}${addressCity}, ${addressState} ${addressZipCode}`.replace(/, ,/g, ',');
}

/**
 * Formats a mobile number for display
 * 
 * @param {string} mobileNumber - The raw mobile number
 * @returns {string} The formatted mobile number
 */
export function formatMobileNumber(mobileNumber: string): string {
  // Simple formatting example - can be customized based on requirements
  if (mobileNumber.length === 10) {
    return `(${mobileNumber.substring(0, 3)}) ${mobileNumber.substring(3, 6)}-${mobileNumber.substring(6)}`;
  }
  return mobileNumber;
}

/**
 * Computes derived fields for a CoApplicant
 * 
 * @param {object} coApplicant - The CoApplicant data
 * @returns {object} The CoApplicant with derived fields
 */
export function computeDerivedFields(coApplicant: any) {
  return {
    ...coApplicant,
    fullName: formatFullName(coApplicant.firstName, coApplicant.lastName),
    fullAddress: formatFullAddress({
      addressLine1: coApplicant.addressLine1,
      addressLine2: coApplicant.addressLine2,
      addressCity: coApplicant.addressCity,
      addressState: coApplicant.addressState,
      addressZipCode: coApplicant.addressZipCode,
    }),
  };
} 