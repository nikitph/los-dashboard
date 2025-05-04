import { z } from "zod";
import { LoanType } from "@prisma/client";

export const createLoanConfirmationSchema = z.object({
  loanApplicationId: z.string().min(1, { message: "validation.loanApplicationId.required" }),
  status: z.enum(["a", "r", "e"], {
    errorMap: () => ({ message: "validation.status.invalid" }),
  }),
  remark: z.string().optional(),
});

export const updateLoanConfirmationSchema = createLoanConfirmationSchema.partial();

export const loanConfirmationApiSchema = createLoanConfirmationSchema.strict();

export const loanConfirmationViewSchema = z.object({
  id: z.string(),
  loanType: z.nativeEnum(LoanType),
  proposedAmount: z.number().nullable(),
  calculatedEMI: z.number().nullable(),
  selectedTenure: z.number().nullable(),
  amountRequested: z.number().nullable(),
  status: z.enum(["a", "r", "e"]),
  remark: z.string().optional(),
});

export type CreateLoanConfirmationInput = z.infer<typeof createLoanConfirmationSchema>;
export type UpdateLoanConfirmationInput = z.infer<typeof updateLoanConfirmationSchema>;
export type LoanConfirmationView = z.infer<typeof loanConfirmationViewSchema>;
