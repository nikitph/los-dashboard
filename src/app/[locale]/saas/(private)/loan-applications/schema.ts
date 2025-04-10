import { z } from "zod";

export const loanFormSchema = z.object({
  loanType: z.enum(["PERSONAL", "VEHICLE", "HOUSE_CONSTRUCTION", "PLOT_PURCHASE", "MORTGAGE"], {
    required_error: "Please select a loan type",
  }),
  requestedAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Please enter a valid amount greater than zero",
  }),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  email: z.string().email("Please enter a valid email address"),
});

// Infer TypeScript type from the schema
export type LoanFormValues = z.infer<typeof loanFormSchema>;
