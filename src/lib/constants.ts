export const indianStates = [
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

/**
 * Returns the abbreviation for Indian states and union territories
 *
 * @param {string} state - Full state or union territory name
 * @returns {string} State abbreviation or original name if not found
 */
export function getStateAbbreviation(state: string): string {
  const stateMap: Record<string, string> = {
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    Assam: "AS",
    Bihar: "BR",
    Chhattisgarh: "CG",
    Goa: "GA",
    Gujarat: "GJ",
    Haryana: "HR",
    "Himachal Pradesh": "HP",
    Jharkhand: "JH",
    Karnataka: "KA",
    Kerala: "KL",
    "Madhya Pradesh": "MP",
    Maharashtra: "MH",
    Manipur: "MN",
    Meghalaya: "ML",
    Mizoram: "MZ",
    Nagaland: "NL",
    Odisha: "OD",
    Punjab: "PB",
    Rajasthan: "RJ",
    Sikkim: "SK",
    "Tamil Nadu": "TN",
    Telangana: "TG",
    Tripura: "TR",
    "Uttar Pradesh": "UP",
    Uttarakhand: "UK",
    "West Bengal": "WB",

    // Union Territories
    "Andaman and Nicobar Islands": "AN",
    Chandigarh: "CH",
    "Dadra and Nagar Haveli and Daman and Diu": "DN",
    Delhi: "DL",
    "Jammu and Kashmir": "JK",
    Ladakh: "LA",
    Lakshadweep: "LD",
    Puducherry: "PY",
  };

  return stateMap[state] || state;
}

/**
 * Returns a list of all Indian states and union territories
 *
 * @returns {string[]} Array of state and union territory names
 */
export function getAllIndianStates(): string[] {
  return [
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
}

/**
 * Validates if a given string is a valid Indian state or union territory
 *
 * @param {string} state - State name to validate
 * @returns {boolean} Whether the state name is valid
 */
export function isValidIndianState(state: string): boolean {
  return getAllIndianStates().includes(state);
}

/**
 * Gets the state name from its abbreviation
 *
 * @param {string} abbr - State abbreviation
 * @returns {string | null} Full state name or null if not found
 */
export function getStateFromAbbreviation(abbr: string): string | null {
  const upperAbbr = abbr.toUpperCase();
  const stateMap = Object.entries(getStateAbbreviationMap()).find(([_, value]) => value === upperAbbr);

  return stateMap ? stateMap[0] : null;
}

/**
 * Returns the mapping of state names to abbreviations
 *
 * @returns {Record<string, string>} Object mapping state names to abbreviations
 */
export function getStateAbbreviationMap(): Record<string, string> {
  return {
    "Andhra Pradesh": "AP",
    "Arunachal Pradesh": "AR",
    Assam: "AS",
    Bihar: "BR",
    Chhattisgarh: "CG",
    Goa: "GA",
    Gujarat: "GJ",
    Haryana: "HR",
    "Himachal Pradesh": "HP",
    Jharkhand: "JH",
    Karnataka: "KA",
    Kerala: "KL",
    "Madhya Pradesh": "MP",
    Maharashtra: "MH",
    Manipur: "MN",
    Meghalaya: "ML",
    Mizoram: "MZ",
    Nagaland: "NL",
    Odisha: "OD",
    Punjab: "PB",
    Rajasthan: "RJ",
    Sikkim: "SK",
    "Tamil Nadu": "TN",
    Telangana: "TG",
    Tripura: "TR",
    "Uttar Pradesh": "UP",
    Uttarakhand: "UK",
    "West Bengal": "WB",

    // Union Territories
    "Andaman and Nicobar Islands": "AN",
    Chandigarh: "CH",
    "Dadra and Nagar Haveli and Daman and Diu": "DN",
    Delhi: "DL",
    "Jammu and Kashmir": "JK",
    Ladakh: "LA",
    Lakshadweep: "LD",
    Puducherry: "PY",
  };
}
