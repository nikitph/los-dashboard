import { z } from "zod";

/**
 * Schema for IncomeDetail validation
 * Defines the structure and validation rules for income detail entries
 */
export const incomeDetailSchema = z.object({
  id: z.string().optional(),
  year: z.number().int().positive("Year must be a positive number"),
  taxableIncome: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
  taxPaid: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
  grossIncome: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
  rentalIncome: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
  incomeFromBusiness: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
  depreciation: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
  grossCashIncome: z
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
});

/**
 * Schema for Income validation
 * Defines the structure and validation rules for income records
 */
export const incomeSchema = z.object({
  id: z.string().optional(),
  applicantId: z.string().uuid("Invalid applicant ID format"),
  type: z.string().min(1, "Employment type is required"),
  dependents: z.number().int().nonnegative("Number of dependents must be a non-negative number").default(0),
  averageMonthlyExpenditure: z
    .number()
    .nonnegative("Average monthly expenditure must be a non-negative number")
    .default(0),
  averageGrossCashIncome: z.number().nonnegative("Average gross cash income must be a non-negative number").default(0),
  incomeDetails: z.array(incomeDetailSchema),
});

/**
 * Schema for Income form validation
 * Includes string transformations for form inputs
 */
export const incomeFormSchema = z.object({
  id: z.string().optional(),
  applicantId: z.string().uuid("Invalid applicant ID format"),
  type: z.string().min(1, "Employment type is required"),
  dependents: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .optional(),
  averageMonthlyExpenditure: z
    .string()
    .transform((val) => {
      if (!val) return 0;
      // Handle percentage strings like "20% or more"
      if (val.includes("%")) {
        const percentMatch = val.match(/(\d+)/);
        return percentMatch ? parseInt(percentMatch[0], 10) / 100 : 0;
      }
      return parseFloat(val) || 0;
    })
    .optional(),
  averageGrossCashIncome: z
    .string()
    .transform((val) => (val ? parseFloat(val) : 0))
    .optional(),
  incomeDetails: z.array(
    z.object({
      id: z.string().optional(),
      year: z.number().int().positive("Year must be a positive number"),
      taxableIncome: z
        .string()
        .transform((value) => (value ? parseFloat(value) : null))
        .optional()
        .nullable(),
      taxPaid: z
        .string()
        .transform((value) => (value ? parseFloat(value) : null))
        .optional()
        .nullable(),
      grossIncome: z
        .string()
        .transform((value) => (value ? parseFloat(value) : null))
        .optional()
        .nullable(),
      rentalIncome: z
        .string()
        .transform((value) => (value ? parseFloat(value) : null))
        .optional()
        .nullable(),
      incomeFromBusiness: z
        .string()
        .transform((value) => (value ? parseFloat(value) : null))
        .optional()
        .nullable(),
      depreciation: z
        .string()
        .transform((value) => (value ? parseFloat(value) : null))
        .optional()
        .nullable(),
      grossCashIncome: z
        .string()
        .transform((value) => (value ? parseFloat(value) : null))
        .optional()
        .nullable(),
    }),
  ),
});

// Type definitions derived from schemas
export type IncomeDetail = z.infer<typeof incomeDetailSchema>;
export type Income = z.infer<typeof incomeSchema>;
export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
