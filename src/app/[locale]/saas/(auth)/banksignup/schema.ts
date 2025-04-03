import { z } from "zod";
import { BankSchema } from "@/schemas/zodSchemas";

// Function to create a translated schema
export const createSignupSchema = (t: (key: string) => string) => {
  return z
    .object({
      firstName: z.string().min(1, t("firstName.required")),
      lastName: z.string().min(1, t("lastName.required")),
      email: z.string().email(t("email.invalid")),
      phoneNumber: z.string().regex(/^[0-9]{10}$/, t("phone.digits")),
      password: z.string().min(6, t("password.minLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("password.match"),
      path: ["confirmPassword"],
    });
};

const identity = <T>(x: T): T => x;

const signupSchema = createSignupSchema(identity);
export type SignupSchemaType = z.infer<typeof signupSchema>;

// Enums for reference
export const PlanTypeEnum = z.enum(["BASIC", "STANDARD", "PREMIUM"]);
export const BillingCycleEnum = z.enum(["MONTHLY", "ANNUAL"]);

// CREATE schema for Subscription
export const SubscriptionCreateSchema = z.object({
  // The bank must already exist, so we need its ID
  bankId: z.string().min(1, "Bank ID is required"),
  // Enums for plan type and billing cycle
  planType: PlanTypeEnum,
  billingCycle: BillingCycleEnum,
  // Start date is required for a new subscription
  startDate: z.date({
    required_error: "startDate is required",
    invalid_type_error: "startDate must be a valid Date",
  }),
  // End date might not be known yet, so optional
  endDate: z.date().optional(),
  // For status, a simple string is fine, e.g., "Active"
  status: z.string().min(1, "Subscription status is required"),
  // The numeric fee for the subscription
  amount: z.number({
    required_error: "Subscription amount is required",
    invalid_type_error: "Subscription amount must be a number",
  }),
  // Payment method can be any JSON structure or absent
  paymentMethod: z.any().optional(),
});

// TypeScript type inference for convenience
export type SubscriptionCreateInput = z.infer<typeof SubscriptionCreateSchema>;

// Response type for the server action
export type SubscriptionActionResponse = {
  success: boolean;
  subscription?: any;
  error?: string;
};

export const createBankSchema = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(3, t("bank.name.minLength")),
    officialEmail: z.string().email(t("bank.officialEmail.invalid")),
  });
};

const bankCreateSchema = createBankSchema(identity);
export type BankCreateSchemaType = z.infer<typeof bankCreateSchema>;

export const createBankInfoSchema = (t: (key: string) => string) => {
  return z.object({
    contactNumber: z.string().regex(/^[6-9]\d{9}$/, { message: t("contactNumber") }),
    addressLine: z.string().min(5, { message: t("addressLine") }),
    city: z.string().min(2, { message: t("city") }),
    state: z.string().min(2, { message: t("state") }),
    zipCode: z.string().regex(/^\d{6}$/, { message: t("zipCode") }),
    legalEntityName: z.string().min(3, { message: t("legalEntityName") }),
    gstNumber: z
      .string()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: t("gstNumber") }),
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: t("panNumber") }),
  });
};

const BankInfoSchema = createBankInfoSchema(identity);

export type BankInfoData = z.infer<typeof BankInfoSchema>;

export type BankFormData = z.infer<typeof BankSchema>;

export type BankCreateInput = Pick<BankFormData, "name" | "officialEmail">;

export type BankFormValues = {
  name: string;
  officialEmail: string;
};

export interface BankCreationFormProps extends React.HTMLAttributes<HTMLDivElement> {
  setCurrentStep: (step: number) => void;
  setBank: (bank: any) => void;
}
