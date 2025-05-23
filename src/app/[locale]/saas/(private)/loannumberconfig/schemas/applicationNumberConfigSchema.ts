import { z } from "zod";

// Separator type enum for validation
export const separatorTypeSchema = z.enum(["HYPHEN", "SLASH", "UNDERSCORE", "DOT", "NONE"]);

// Loan type enum for validation
export const loanTypeSchema = z.enum([
  "PERSONAL",
  "VEHICLE",
  "HOUSE_CONSTRUCTION",
  "PLOT_AND_HOUSE_CONSTRUCTION",
  "PLOT_PURCHASE",
  "MORTGAGE",
]);

/**
 * Schema for creating a new application number configuration
 * Used in forms and create API endpoints
 */
export const createApplicationNumberConfigSchema = z.object({
  bankId: z.string().min(1, { message: "validation.bankId.required" }),
  separator: separatorTypeSchema.default("HYPHEN"),
  includePrefix: z.boolean().default(false),
  includeBranch: z.boolean().default(false),
  includeLoanType: z.boolean().default(false),
  includeDate: z.boolean().default(false),
  bankName: z.string().min(1, { message: "validation.bankName.required" }),
  branchNumber: z.string().optional(),
  loanTypeCode: z.string().optional(),
  serialNumberPadding: z.number().min(1).max(10).default(5),
});

/**
 * Schema for updating an existing application number configuration
 * Makes all fields optional except id for PATCH operations
 */
export const updateApplicationNumberConfigSchema = createApplicationNumberConfigSchema
  .extend({
    id: z.string().uuid({ message: "validation.id.invalid" }),
  })
  .partial()
  .extend({
    id: z.string().uuid({ message: "validation.id.invalid" }),
  });

/**
 * Schema for strict API validation with no extra fields
 * Used in server actions to prevent field injection
 */
export const applicationNumberConfigApiSchema = createApplicationNumberConfigSchema.strict();

/**
 * Schema for view-only data including computed and read-only fields
 * Used in display components and list tables
 */
export const applicationNumberConfigViewSchema = z.object({
  id: z.string().uuid(),
  bankId: z.string(),
  separator: separatorTypeSchema,
  includePrefix: z.boolean(),
  includeBranch: z.boolean(),
  includeLoanType: z.boolean(),
  includeDate: z.boolean(),
  bankName: z.string(),
  branchNumber: z.string().optional(),
  loanTypeCode: z.string().optional(),
  serialNumberPadding: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Computed fields
  formattedCreatedAt: z.string(),
  formattedUpdatedAt: z.string(),
  previewNumber: z.string(),
  isActive: z.boolean(),
});

// Inferred TypeScript types
export type CreateApplicationNumberConfigInput = z.infer<typeof createApplicationNumberConfigSchema>;
export type UpdateApplicationNumberConfigInput = z.infer<typeof updateApplicationNumberConfigSchema>;
export type ApplicationNumberConfigApiInput = z.infer<typeof applicationNumberConfigApiSchema>;
export type ApplicationNumberConfigView = z.infer<typeof applicationNumberConfigViewSchema>;

// Separator display mapping for UI
export const separatorDisplayMap = {
  HYPHEN: "-",
  SLASH: "/",
  UNDERSCORE: "_",
  DOT: ".",
  NONE: "",
} as const;

// Loan type display codes
export const loanTypeCodeMap = {
  PERSONAL: "PL",
  VEHICLE: "VL",
  HOUSE_CONSTRUCTION: "HC",
  PLOT_AND_HOUSE_CONSTRUCTION: "PHC",
  PLOT_PURCHASE: "PP",
  MORTGAGE: "ML",
} as const;
