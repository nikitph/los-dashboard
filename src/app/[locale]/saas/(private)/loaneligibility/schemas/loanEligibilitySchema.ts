import { z } from "zod";

export const confirmLoanEligibilitySchema = z.object({
  loanApplicationId: z.string().min(1, { message: "validation.loanApplicationId.required" }),
  proposedAmount: z.number().positive({ message: "validation.proposedAmount.positive" }),
  selectedTenure: z.number().int().positive({ message: "validation.selectedTenure.positive" }),
  calculatedEMI: z.number().positive({ message: "validation.calculatedEMI.positive" }),
  accepted: z.boolean(),
});

export const updateLoanEligibilitySchema = confirmLoanEligibilitySchema.partial();

export const loanEligibilityApiSchema = confirmLoanEligibilitySchema.strict();

export const loanEligibilityViewSchema = z.object({
  id: z.string(),
  loanApplicationId: z.string(),
  eligibleLoanAmount: z.number().nullable(),
  proposedAmount: z.number().nullable(),
  selectedTenure: z.number().nullable(),
  calculatedEMI: z.number().nullable(),
  accepted: z.boolean().optional(),
});

export type ConfirmLoanEligibilityInput = z.infer<typeof confirmLoanEligibilitySchema>;
export type UpdateLoanEligibilityInput = z.infer<typeof updateLoanEligibilitySchema>;
export type LoanEligibilityView = z.infer<typeof loanEligibilityViewSchema>;

export type TenureOption = {
  id: string;
  tenure: number;
  unit: string;
  emi: number;
};
