import { z } from "zod";
import { identity } from "@/lib/utils";

export const createLoanSchema = (t: (key: string) => string) => {
  return z.object({
    loanType: z.enum(
      ["PERSONAL", "VEHICLE", "HOUSE_CONSTRUCTION", "PLOT_PURCHASE", "MORTGAGE", "PLOT_AND_HOUSE_CONSTRUCTION"],
      {
        required_error: t("loanType"),
      },
    ),
    requestedAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: t("requestedAmount"),
    }),
    firstName: z.string().min(1, {
      message: t("firstName"),
    }),
    lastName: z.string().min(1, {
      message: t("lastName"),
    }),
    phoneNumber: z.string().regex(/^\d{10}$/, {
      message: t("phoneNumber"),
    }),
    email: z.string().email({
      message: t("email"),
    }),
    bankId: z.string().uuid(),
  });
};

// Base schema type
export const loanSchema = createLoanSchema(identity); // dummy t for inference
export type LoanFormData = z.infer<typeof loanSchema>;

// Interface variations
export interface CreateLoanInput extends LoanFormData {}

export interface UpdateLoanInput extends Partial<LoanFormData> {
  id: string;
}

export interface LoanListItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  loanType: string;
  requestedAmount: string;
}
