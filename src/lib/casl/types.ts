import { MongoAbility } from "@casl/ability";

export type Actions = "manage" | "create" | "read" | "update" | "delete";

// Model names as string subjects
export type Subjects =
  | "Applicant"
  | "ApplicationNumberConfiguration"
  | "AuditLog"
  | "Bank"
  | "BankConfiguration"
  | "BusinessVerification"
  | "CoApplicant"
  | "Dependent"
  | "Document"
  | "Guarantor"
  | "Income"
  | "IncomeDetail"
  | "LoanApplication"
  | "LoanObligation"
  | "LoanObligationDetail"
  | "PendingAction"
  | "PropertyVerification"
  | "ResidenceVerification"
  | "Subscription"
  | "TimelineEvent"
  | "UserProfile"
  | "UserRoles"
  | "VehicleVerification"
  | "Verification"
  | "Review"
  | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;
