import { z } from "zod";

/**
 * Enum for loan application status
 */
export const loanStatusEnum = z.enum([
  "DRAFT",
  "PENDING_INSPECTOR_ASSIGNMENT",
  "PENDING_LOAN_OFFICER_ASSIGNMENT",
  "PENDING_LOAN_OFFICER_REVIEW",
  "PENDING_VERIFICATION",
  "VERIFICATION_IN_PROGRESS",
  "VERIFICATION_COMPLETED",
  "VERIFICATION_FAILED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REJECTED_BY_APPLICANT",
  "UNDER_REVIEW",
]);

/**
 * Enum for loan type
 */
export const loanTypeEnum = z.enum(
  ["PERSONAL", "VEHICLE", "HOUSE_CONSTRUCTION", "PLOT_PURCHASE", "MORTGAGE", "PLOT_AND_HOUSE_CONSTRUCTION"],
  {
    errorMap: () => ({ message: "validation.loanType.invalid" }),
  },
);

/**
 * Schema for creating a new loan application
 * Contains validation with translation keys for error messages
 */
export const createLoanApplicationSchema = z.object({
  applicantId: z.string().min(1, { message: "validation.applicantId.required" }),
  bankId: z.string().min(1, { message: "validation.bankId.required" }),
  loanType: loanTypeEnum,
  amountRequested: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "validation.amountRequested.positive",
  }),
  status: loanStatusEnum.default("PENDING"),
});

/**
 * Schema for updating an existing loan application
 * Extends the create schema with id and makes all fields optional for partial updates
 */
export const updateLoanApplicationSchema = createLoanApplicationSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
  })
  .partial();

/**
 * Schema for new loan application form that is part of the wizard
 * Extends the create schema with name and makes some fields optional for partial updates
 */
export const newLoanApplicationSchema = createLoanApplicationSchema
  .extend({
    firstName: z.string().min(1, "validation.firstName.required"),
    lastName: z.string().min(1, "validation.lastName.required"),
    phoneNumber: z.string().regex(/^\d{10}$/, "validation.phoneNumber.format"),
    email: z.string().email("validation.email.format"),
  })
  .partial({ applicantId: true, status: true });

/**
 * API schema for loan application validation
 * Uses strict validation to prevent unknown fields
 */
export const loanApplicationApiSchema = createLoanApplicationSchema.strict();

/**
 * View schema for loan application display
 * Includes all fields including read-only and derived fields
 */
export const loanApplicationViewSchema = z.object({
  id: z.string(),
  applicantId: z.string(),
  bankId: z.string(),
  loanType: loanTypeEnum,
  amountRequested: z.number(),
  selectedTenure: z.number().optional(),
  proposedAmount: z.number().optional(),
  calculatedEMI: z.number().optional(),
  status: loanStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),

  // Applicant Relation
  applicant: z.object({
    id: z.string(),
    userId: z.string(),
    dateOfBirth: z.date().optional().nullable(),
    addressState: z.string().optional().nullable(),
    addressCity: z.string().optional().nullable(),
    addressFull: z.string().optional().nullable(),
    addressPinCode: z.string().optional().nullable(),
    aadharNumber: z.string().optional().nullable(),
    panNumber: z.string().optional().nullable(),
    aadharVerificationStatus: z.boolean(),
    panVerificationStatus: z.boolean(),
    photoUrl: z.string().optional().nullable(),
    bankId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable().optional(),
    user: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      phoneNumber: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      deletedAt: z.date().nullable().optional(),
    }),
  }),

  // CoApplicants
  coApplicants: z.array(
    z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      addressState: z.string(),
      addressCity: z.string(),
      addressZipCode: z.string(),
      addressLine1: z.string(),
      addressLine2: z.string().nullable().optional(),
      mobileNumber: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      deletedAt: z.date().nullable().optional(),
    }),
  ),

  // Guarantors
  guarantors: z.array(
    z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      addressState: z.string(),
      addressCity: z.string(),
      addressZipCode: z.string(),
      addressLine1: z.string(),
      addressLine2: z.string().nullable().optional(),
      mobileNumber: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      deletedAt: z.date().nullable().optional(),
    }),
  ),

  // Documents
  documents: z.array(
    z.object({
      id: z.string(),
      fileUrl: z.string(),
      fileName: z.string(),
      fileSize: z.number(),
      mimeType: z.string(),
      documentType: z.string(),
      status: z.string(),
      uploadedAt: z.date(),
      deletedAt: z.date().nullable().optional(),
    }),
  ),

  // Verifications
  verifications: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      status: z.string(),
      verifiedAt: z.date().optional().nullable(),
      remarks: z.string().optional().nullable(),
      result: z.boolean().optional().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
      deletedAt: z.date().nullable().optional(),
    }),
  ),

  // Timeline Events
  timelineEvents: z.array(
    z.object({
      id: z.string(),
      timelineEntityType: z.string(),
      timelineEntityId: z.string(),
      timelineEventType: z.string(),
      actionData: z.any().optional(),
      remarks: z.string().optional().nullable(),
      createdAt: z.date(),
      userId: z.string(),
      user: z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        phoneNumber: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
        deletedAt: z.date().nullable().optional(),
      }),
    }),
  ),
});

// Inferred types
export type NewLoanApplicationInput = z.infer<typeof newLoanApplicationSchema>;
export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>;
export type UpdateLoanApplicationInput = z.infer<typeof updateLoanApplicationSchema>;
export type LoanApplicationView = z.infer<typeof loanApplicationViewSchema>;

export type LoanApplicationFormValues = Omit<CreateLoanApplicationInput, "id"> & {
  id?: string;
};
