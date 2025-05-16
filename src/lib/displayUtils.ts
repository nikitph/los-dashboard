import { differenceInYears, format, formatDistanceToNow, Locale } from "date-fns";
import { enUS } from "date-fns/locale";

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

interface CurrencyParams {
  number: number;
  maxFractionDigits?: number;
  currency?: string;
}

interface PercentageParams {
  number: number;
  decimals?: number;
}

interface MillionParams {
  number: number;
  decimals?: number;
}

type FormatterFunctions = {
  currency: (params: CurrencyParams) => string;
  unit: (number: number) => string;
  percentage: (params: PercentageParams) => string;
  million: (params: MillionParams) => string;
};
export const formatters: FormatterFunctions = {
  currency: ({ number, maxFractionDigits = 2, currency = "USD" }: CurrencyParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: maxFractionDigits,
    }).format(number);
  },

  unit: (number: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
    }).format(number);
  },

  percentage: ({ number, decimals = 1 }: PercentageParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  },

  million: ({ number, decimals = 1 }: MillionParams): string => {
    return `${new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)}M`;
  },
};

/**
 * Formats a date/time into a relative "time ago" string.
 * @param input - Date or string, can be null/undefined
 * @param options - Optional fallback, locale, and suffix
 * @returns Formatted "X time ago" string or fallback
 */
export function getTimeAgo(
  input: Date | string | null | undefined,
  options?: {
    fallback?: string;
    locale?: Locale;
    addSuffix?: boolean;
  },
): string {
  const { fallback = "–", locale = enUS, addSuffix = true } = options || {};

  try {
    const date = typeof input === "string" ? new Date(input) : input;
    if (!date || isNaN(date.getTime())) return fallback;

    return formatDistanceToNow(date, {
      addSuffix,
      locale,
    });
  } catch {
    return fallback;
  }
}

/**
 * Calculates age from date of birth
 * @param dob Date object or date string
 * @returns Age in years or null if invalid
 */
export function calculateAge(dob: Date | string | null | undefined): number | null {
  if (!dob) return null;
  const date = typeof dob === "string" ? new Date(dob) : dob;
  if (isNaN(date.getTime())) return null;

  return differenceInYears(new Date(), date);
}
