import { GuarantorView } from "../schemas/guarantorSchema";

/**
 * Formats a guarantor's full name by combining first and last name
 *
 * @param {string} firstName - The guarantor's first name
 * @param {string} lastName - The guarantor's last name
 * @returns {string} The formatted full name
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Formats a guarantor's full address from individual address components
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
 * Transforms a guarantor data object into a view model with derived fields
 *
 * @param {object} guarantor - The raw guarantor data
 * @returns {GuarantorView} The guarantor view model with derived fields
 */
export function transformToGuarantorView(guarantor: any): GuarantorView {
  return {
    ...guarantor,
    fullName: formatFullName(guarantor.firstName, guarantor.lastName),
    fullAddress: formatFullAddress({
      addressLine1: guarantor.addressLine1,
      addressLine2: guarantor.addressLine2,
      addressCity: guarantor.addressCity,
      addressState: guarantor.addressState,
      addressZipCode: guarantor.addressZipCode,
    }),
  };
}

/**
 * Validates a phone number format
 *
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic US phone number validation (10 digits, with optional formatting)
  const phoneRegex = /^(\+\d{1,2}\s?)?(\()?\d{3}(\))?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Formats a phone number to a consistent format
 *
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  // Check if it's a valid US number (10 digits)
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.substring(0, 3)}) ${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6)}`;
  }

  // Return original if not a standard format
  return phone;
}

/**
 * Validates if a guarantor record has all required fields
 *
 * @param {Partial<GuarantorView>} guarantor - The guarantor data to validate
 * @returns {boolean} Whether the guarantor has all required fields
 */
export function isGuarantorComplete(guarantor: Partial<GuarantorView>): boolean {
  return !!(
    guarantor.firstName &&
    guarantor.lastName &&
    guarantor.email &&
    guarantor.mobileNumber &&
    guarantor.addressLine1 &&
    guarantor.addressCity &&
    guarantor.addressState &&
    guarantor.addressZipCode
  );
}
