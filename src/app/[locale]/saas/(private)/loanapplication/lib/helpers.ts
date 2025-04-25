import { LoanApplicationView } from "../schemas/loanApplicationSchema";

/**
 * Maps loan status to a badge color for UI display
 *
 * @param {string} status - The loan application status
 * @returns {string} CSS class name for the badge
 */
export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "UNDER_REVIEW":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "PENDING":
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  }
}

/**
 * Maps loan type to a human-readable format
 *
 * @param {string} loanType - The loan type from enum
 * @returns {string} Formatted loan type string
 */
export function formatLoanType(loanType: string): string {
  switch (loanType) {
    case "PERSONAL":
      return "Personal Loan";
    case "VEHICLE":
      return "Vehicle Loan";
    case "HOUSE_CONSTRUCTION":
      return "House Construction Loan";
    case "PLOT_PURCHASE":
      return "Plot Purchase Loan";
    case "MORTGAGE":
      return "Mortgage Loan";
    default:
      return loanType;
  }
}

/**
 * Maps loan status to a human-readable format
 *
 * @param {string} status - The loan application status
 * @returns {string} Formatted status string
 */
export function formatLoanStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "UNDER_REVIEW":
      return "Under Review";
    default:
      return status;
  }
}

/**
 * Formats a currency amount with the specified locale and currency
 *
 * @param {number} amount - The amount to format
 * @param {string} locale - The locale to use for formatting (default: 'en-IN')
 * @param {string} currency - The currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount: number, locale: string = "en-IN", currency: string = "INR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date with the specified locale and options
 *
 * @param {Date | string | null | undefined} date - The date to format
 * @param {string} locale - The locale to use for formatting (default: 'en-IN')
 * @returns {string} Formatted date string
 */
export function formatDate(date: Date | string | null | undefined, locale: string = "en-IN"): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Enhances a loan application with derived fields for display
 *
 * @param {any} loanApplication - The raw loan application data from database
 * @param {string} locale - The locale to use for formatting (default: 'en-IN')
 * @returns {LoanApplicationView} Enhanced loan application with derived fields
 */
export function enhanceLoanApplication(loanApplication: any, locale: string = "en-IN"): LoanApplicationView {
  return {
    ...loanApplication,
    // Format dates
    formattedCreatedAt: formatDate(loanApplication.createdAt, locale),
    formattedUpdatedAt: formatDate(loanApplication.updatedAt, locale),
    // Format amount
    formattedAmount: formatCurrency(loanApplication.amountRequested, locale),
    // Get status badge color
    statusBadgeColor: getStatusBadgeColor(loanApplication.status),
    // Set applicant name if available
    applicantName: loanApplication.applicant
      ? `${loanApplication.applicant.firstName || ""} ${loanApplication.applicant.lastName || ""}`.trim()
      : undefined,
  };
}
