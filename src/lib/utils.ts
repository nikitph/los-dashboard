import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with tailwind-merge
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700",
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
];

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
];

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

export // List of all Indian states and union territories
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const identity = <T>(x: T): T => x;

/**
 * Converts a data URL to a File object
 * @param {string} dataUrl - The data URL (e.g. from canvas.toDataURL())
 * @param {string} filename - The filename to use for the File object
 * @param {string} [mimeType] - Optional MIME type (will attempt to extract from dataURL if not provided)
 * @return {File} - The converted File object
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  // Extract the MIME type from the dataURL
  const arr: string[] = dataUrl.split(",");
  const matches: RegExpMatchArray | null = arr[0].match(/:(.*?);/);

  if (!matches || matches.length < 2) {
    throw new Error("Invalid data URL format");
  }

  const mime: string = matches[1];

  // Convert base64 to binary
  const bstr: string = atob(arr[1]);
  let n: number = bstr.length;
  const u8arr: Uint8Array = new Uint8Array(n);

  // Convert binary to Uint8Array
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  // Create and return File object
  return new File([u8arr], filename, { type: mime });
}
