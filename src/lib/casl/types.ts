import { InferSubjects, MongoAbility } from "@casl/ability";
import {
  Applicant,
  AuditLog,
  Bank,
  BankConfiguration,
  BusinessVerification,
  CoApplicant,
  Dependent,
  Document,
  Guarantor,
  Income,
  IncomeDetail,
  LoanApplication,
  LoanObligation,
  LoanObligationDetail,
  PendingAction,
  PropertyVerification,
  ResidenceVerification,
  Subscription,
  UserProfile,
  UserRoles,
  VehicleVerification,
  Verification,
} from "@prisma/client";

export type Actions = "manage" | "create" | "read" | "update" | "delete";

// Model names as subject strings
export type Subjects =
  | InferSubjects<
      | Applicant
      | AuditLog
      | Bank
      | BankConfiguration
      | CoApplicant
      | Dependent
      | Document
      | Income
      | IncomeDetail
      | LoanApplication
      | LoanObligation
      | LoanObligationDetail
      | PendingAction
      | Subscription
      | UserProfile
      | UserRoles
      | Verification
      | Guarantor
      | ResidenceVerification
      | BusinessVerification
      | PropertyVerification
      | VehicleVerification
    >
  | "all";

export type AppAbility = MongoAbility<[Actions, Subjects]>;
