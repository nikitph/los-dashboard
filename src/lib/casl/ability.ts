import { User } from "@/types/globalTypes";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AppAbility } from "./types";

export function defineAbilityFor(user: User | null | undefined): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  const manageableSubjects = [
    "UserProfile",
    "ApplicationNumberConfiguration",
    "LoanApplication",
    "LoanObligation",
    "LoanObligationDetail",
    "Document",
    "Income",
    "IncomeDetail",
    "Verification",
    "Applicant",
    "Guarantor",
    "CoApplicant",
    "PendingAction",
    "BankConfiguration",
    "Subscription",
    "TimelineEvent",
    "Review",
  ] as const;

  if (!user) return build();

  // SAAS_ADMIN – Full access
  if (user.roles.some((r) => r.role === "SAAS_ADMIN")) {
    can("manage", "all");
    return build();
  }

  for (const role of user.roles) {
    const { role: roleType, bankId } = role;

    switch (roleType) {
      case "BANK_ADMIN": {
        if (!bankId) break;
        can("read", "Bank", { id: bankId } as any);
        manageableSubjects.forEach((subject) => {
          can("manage", subject);
        });
        break;
      }

      case "LOAN_OFFICER": {
        if (!bankId) break;
        can("read", "Bank", { id: bankId } as any);
        can(["read", "create", "update"], ["LoanApplication", "Applicant", "Document", "Guarantor", "CoApplicant"], {
          id: bankId,
        } as any);
        can("read", "UserProfile");
        break;
      }

      case "CLERK": {
        if (!bankId) break;
        can("read", "Bank", { id: bankId } as any);
        can("create", ["LoanApplication", "Applicant", "Document", "Guarantor", "CoApplicant"], { id: bankId } as any);
        can("read", "UserProfile");
        break;
      }

      case "INSPECTOR": {
        if (!bankId) break;
        can("read", ["LoanApplication", "Verification", "Document", "Applicant"], { id: bankId } as any);
        can("update", "Verification", { id: bankId } as any);
        break;
      }

      case "CEO":
      case "LOAN_COMMITTEE":
      case "BOARD": {
        if (!bankId) break;
        can("read", ["LoanApplication", "Applicant", "Guarantor", "Document", "Verification"], { id: bankId } as any);
        can("update", "LoanApplication", { id: bankId } as any);
        break;
      }

      case "APPLICANT": {
        can("read", ["LoanApplication", "Document", "UserProfile", "Verification"], { userId: user.id } as any);
        can("update", "UserProfile", { id: user.id } as any);
        break;
      }

      case "USER": {
        // Default fallback role for authenticated but unassigned users
        can("read", "UserProfile", { id: user.id } as any);
        break;
      }
    }
  }

  return build();
}
