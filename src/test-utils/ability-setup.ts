// src/test-utils/ability-setup.ts
import { createMongoAbility, MongoAbility } from "@casl/ability";
import { PrismaQuery, Subjects } from "@casl/prisma";
import { Actions, AppAbility } from "@/lib/casl/types";

/**
 * Creates a test ability with specified rules
 *
 * @param rules - CASL ability rules to apply
 * @returns AppAbility instance for testing
 */
export function createTestAbility(rules: any[] = []): AppAbility {
  return <MongoAbility<[Actions, Subjects<any>]>>createMongoAbility<[string, Subjects<any>], PrismaQuery>(rules);
}

/**
 * Predefined test abilities for common roles
 */
export const testAbilities = {
  // CLERK: basic data entry permissions
  CLERK: createTestAbility([
    { action: "read", subject: "Guarantor", fields: ["firstName", "lastName", "mobileNumber", "loanApplicationId"] },
    { action: "create", subject: "Guarantor" },
    { action: "update", subject: "Guarantor", fields: ["firstName", "lastName", "mobileNumber"] },
  ]),

  // LOAN_OFFICER: expanded permissions
  LOAN_OFFICER: createTestAbility([
    { action: "read", subject: "Guarantor" },
    { action: "create", subject: "Guarantor" },
    { action: "update", subject: "Guarantor" },
    { action: "delete", subject: "Guarantor" },
  ]),

  // ADMIN: full permissions
  ADMIN: createTestAbility([{ action: "manage", subject: "all" }]),

  // Add more role-based abilities as needed
};
