import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { AppAbility, Applicant, Bank, Document, LoanApplication, User, UserProfile, Verification } from "./types";

export function defineAbilityFor(user: User | undefined): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (!user) {
    // If user is not logged in, no permissions
    return build();
  }

  // Check if user has SAAS_ADMIN role
  if (user.roles.some((role) => role.role === "SAAS_ADMIN")) {
    // SaaS Admin can do everything
    can("manage", "all");
    return build();
  }

  // Check if user has BANK_ADMIN role
  const bankAdminRoles = user.roles.filter((role) => role.role === "BANK_ADMIN");
  if (bankAdminRoles.length > 0) {
    // Bank Admin permissions for their banks
    bankAdminRoles.forEach((role) => {
      if (role.bankId) {
        can(["read", "update"], Bank, { id: role.bankId });
        can(["read", "create", "update"], UserProfile);
        can("manage", LoanApplication, { bankId: role.bankId });
        can("manage", Document, { bankId: role.bankId });
        can("manage", Verification, { bankId: role.bankId });
        can("manage", Applicant, { bankId: role.bankId });
      }
    });
  }

  // Loan Officer permissions
  const loanOfficerRoles = user.roles.filter((role) => role.role === "LOAN_OFFICER");
  if (loanOfficerRoles.length > 0) {
    loanOfficerRoles.forEach((role) => {
      if (role.bankId) {
        can("read", Bank, { id: role.bankId });
        can(["read", "create"], LoanApplication, { bankId: role.bankId });
        can(["read", "create"], Applicant, { bankId: role.bankId });
        can(["read", "create", "update"], Document, { bankId: role.bankId });
      }
    });
  }

  return build();
}
