import { format } from "date-fns";

export function formatDate(date: Date | string) {
  if (!date) return "";
  return format(new Date(date), "dd MMM yyyy");
}

/**
 * Formats a number as currency (Indian Rupees)
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "N/A";

  // Format as Indian currency
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number as percentage
 * @param value Value to format as percentage
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null) return "N/A";

  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncates a string if it exceeds the maximum length
 * @param str String to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string with ellipsis or original string
 */
export function truncateString(str: string | undefined | null, maxLength = 50): string {
  if (!str) return "";

  if (str.length <= maxLength) return str;

  return `${str.substring(0, maxLength)}...`;
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str String to capitalize
 * @returns String with first letter of each word capitalized
 */
export function capitalizeWords(str: string | undefined | null): string {
  if (!str) return "";

  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
