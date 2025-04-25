import { formatDate } from "@/lib/displayUtils";
import { ApplicantView } from "../schemas/applicantSchema";

/**
 * Formats the applicant data for display, including derived fields
 *
 * @param applicant - The raw applicant data from the database
 * @returns ApplicantView with formatted and derived fields
 */
export function formatApplicantForDisplay(applicant: any): ApplicantView {
  const formattedApplicant: ApplicantView = {
    ...applicant,
    formattedCreatedAt: applicant.createdAt ? formatDate(applicant.createdAt) : undefined,
    formattedDateOfBirth: applicant.dateOfBirth ? formatDate(applicant.dateOfBirth) : undefined,
  };

  // Generate full address if component parts exist
  if (applicant.addressFull || applicant.addressCity || applicant.addressState) {
    const addressParts = [
      applicant.addressFull,
      applicant.addressCity,
      applicant.addressState,
      applicant.addressPinCode,
    ].filter(Boolean);

    formattedApplicant.fullAddress = addressParts.join(", ");
  }

  // Compute verification status
  if (applicant.aadharVerificationStatus !== undefined || applicant.panVerificationStatus !== undefined) {
    const aadharVerified = applicant.aadharVerificationStatus === true;
    const panVerified = applicant.panVerificationStatus === true;

    if (aadharVerified && panVerified) {
      formattedApplicant.verificationStatus = "FULLY_VERIFIED";
    } else if (aadharVerified || panVerified) {
      formattedApplicant.verificationStatus = "PARTIALLY_VERIFIED";
    } else {
      formattedApplicant.verificationStatus = "UNVERIFIED";
    }
  }

  return formattedApplicant;
}

/**
 * Returns styled badge color based on verification status
 *
 * @param status - The verification status string
 * @returns CSS class name for the badge
 */
export function getVerificationStatusColor(status: string | undefined): string {
  switch (status) {
    case "FULLY_VERIFIED":
      return "bg-green-100 text-green-800";
    case "PARTIALLY_VERIFIED":
      return "bg-yellow-100 text-yellow-800";
    case "UNVERIFIED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Validates an Aadhar number format
 *
 * @param aadhar - The Aadhar number to validate
 * @returns true if valid, false otherwise
 */
export function isValidAadharNumber(aadhar: string | null | undefined): boolean {
  if (!aadhar) return false;
  // Aadhar is a 12-digit number
  return /^\d{12}$/.test(aadhar);
}

/**
 * Validates a PAN number format
 *
 * @param pan - The PAN number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPanNumber(pan: string | null | undefined): boolean {
  if (!pan) return false;
  // PAN is in format: AAAAA9999A (5 letters, 4 digits, 1 letter)
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
}

/**
 * Formats an Aadhar number for display (masked format)
 *
 * @param aadhar - The raw Aadhar number
 * @returns Masked Aadhar number (e.g., XXXX-XXXX-1234)
 */
export function formatAadharForDisplay(aadhar: string | null | undefined): string {
  if (!aadhar) return "";
  if (aadhar.length !== 12) return aadhar;

  // Show only last 4 digits
  return `XXXX-XXXX-${aadhar.substring(8, 12)}`;
}

/**
 * Formats a PAN number for display (partially masked)
 *
 * @param pan - The raw PAN number
 * @returns Partially masked PAN number (e.g., AAAXX9999X)
 */
export function formatPanForDisplay(pan: string | null | undefined): string {
  if (!pan) return "";
  if (pan.length !== 10) return pan;

  // Mask the middle part
  return `${pan.substring(0, 3)}XX${pan.substring(5)}`;
}
