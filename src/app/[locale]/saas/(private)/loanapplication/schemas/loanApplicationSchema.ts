import { z } from "zod";

/**
 * Schema for creating a new loan application
 * Contains validation with translation keys for error messages
 */
export const createLoanApplicationSchema = z.object({
  applicantId: z.string().min(1, { message: "validation.applicantId.required" }),
  bankId: z.string().min(1, { message: "validation.bankId.required" }),
  loanType: z.enum(["PERSONAL", "VEHICLE", "HOUSE_CONSTRUCTION", "PLOT_PURCHASE", "MORTGAGE"], {
    errorMap: () => ({ message: "validation.loanType.invalid" }),
  }),
  amountRequested: z.number().positive({ message: "validation.amountRequested.positive" }),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"], {
      errorMap: () => ({ message: "validation.status.invalid" }),
    })
    .default("PENDING"),
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
  loanType: z.enum(["PERSONAL", "VEHICLE", "HOUSE_CONSTRUCTION", "PLOT_PURCHASE", "MORTGAGE"]),
  amountRequested: z.number(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional().nullable(),
  applicantName: z.string().optional(), // Derived field
  formattedAmount: z.string().optional(), // Derived field
  formattedCreatedAt: z.string().optional(), // Derived field
  formattedUpdatedAt: z.string().optional(), // Derived field
  statusBadgeColor: z.string().optional(), // Derived field for UI
});

// Inferred types
export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>;
export type UpdateLoanApplicationInput = z.infer<typeof updateLoanApplicationSchema>;
export type LoanApplicationView = z.infer<typeof loanApplicationViewSchema>;

export type LoanApplicationFormValues = Omit<CreateLoanApplicationInput, "id"> & {
  id?: string;
};
