import { AppAbility } from "@/lib/casl/types";

/**
 * Defines which review fields are visible to the user based on their permissions
 *
 * @param {AppAbility} ability - The user's CASL ability object
 * @returns {Record<string, boolean>} Object mapping field names to visibility status
 */
export function defineReviewFieldVisibility(ability: AppAbility) {
  return {
    remarks: ability.can("create", "Review", "remarks"),
    result: ability.can("create", "Review", "result"),
    canUpdateRemarks: ability.can("update", "Review", "remarks"),
    canUpdateResult: ability.can("update", "Review", "result"),
  };
}
