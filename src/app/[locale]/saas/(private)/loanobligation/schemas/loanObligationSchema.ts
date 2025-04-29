import * as z from "zod";

// Schema for loan obligation detail
export const loanObligationDetailSchema = z.object({
  outstandingLoan: z.string().refine((val) => !isNaN(Number(val)) && val !== "", {
    message: "validation.outstandingLoan.required",
  }),
  emiAmount: z.string().refine((val) => !isNaN(Number(val)) && val !== "", {
    message: "validation.emiAmount.required",
  }),
  loanDate: z.string().min(1, { message: "validation.loanDate.required" }),
  loanType: z.string().min(1, { message: "validation.loanType.required" }),
  bankName: z.string().min(1, { message: "validation.bankName.required" }),
});

// Schema for the main loan obligation form
export const loanObligationSchema = z.object({
  cibilScore: z
    .string()
    .refine((val) => !isNaN(Number(val)) && val !== "", {
      message: "validation.cibilScore.required",
    })
    .refine((val) => Number(val) >= 300 && Number(val) <= 900, {
      message: "validation.cibilScore.invalid",
    }),
  loans: z.array(loanObligationDetailSchema),
});

// Type definitions derived from the schemas
export type LoanObligationDetailFormValues = z.infer<typeof loanObligationDetailSchema>;
export type LoanObligationFormValues = z.infer<typeof loanObligationSchema>;

// Default empty values for form initialization
export const emptyLoanObligationDetail: LoanObligationDetailFormValues = {
  outstandingLoan: "",
  emiAmount: "",
  loanDate: "",
  loanType: "",
  bankName: "",
};

export const emptyLoanObligation: LoanObligationFormValues = {
  cibilScore: "",
  loans: [emptyLoanObligationDetail],
};
