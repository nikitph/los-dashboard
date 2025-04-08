// app/lib/casl/types.ts
import { InferSubjects, MongoAbility } from "@casl/ability";
import { RoleType } from "@prisma/client";

// Define your actions
export type Actions = "manage" | "create" | "read" | "update" | "delete" | "approve" | "reject" | "verify";

// Define your subject classes/types
export class Bank {
  id?: string;
}

export class LoanApplication {
  bankId?: string;
  userId?: string;
  id?: string;
}

export class Document {
  bankId?: string;
  uploadedById?: string;
  id?: string;
}

export class Verification {
  bankId?: string;
  id?: string;
}

export class Applicant {
  bankId?: string;
  id?: string;
}

export class UserProfile {
  id?: string;
  email?: string;
}

// Use InferSubjects to get the union type
export type Subjects =
  | InferSubjects<
      | typeof Bank
      | typeof LoanApplication
      | typeof Document
      | typeof Verification
      | typeof Applicant
      | typeof UserProfile
    >
  | "all";

// Define your AppAbility type - note the MongoAbility usage for v6
export type AppAbility = MongoAbility<[Actions, Subjects]>;

// Define your user type
export type User = {
  id: string;
  roles: {
    role: RoleType;
    bankId?: string;
  }[];
};
