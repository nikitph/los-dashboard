import { z } from "zod";

export const PersonalInformationSchema = z.object({
  dateOfBirth: z.coerce.date().refine(
    (date) => {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      return date <= eighteenYearsAgo;
    },
    { message: "Applicant must be at least 18 years old" },
  ),
  addressState: z.string().min(1, "State is required"),
  addressCity: z.string().min(1, "City is required"),
  addressFull: z.string().min(1, "Address is required"),
  addressPinCode: z.string().regex(/^\d{6}$/, "Pin code must be 6 digits"),
  aadharNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhar number must be 12 digits")
    .refine(
      (aadhar) => {
        const digits = aadhar.split("").map(Number);
        return digits.length === 12;
      },
      { message: "Invalid Aadhar number" },
    ),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "PAN must be valid format (e.g., ABCDE1234F)"),
  aadharVerificationStatus: z
    .boolean()
    .default(false)
    .refine((data) => data, {
      message: "Aadhar must be verified",
    }),
  panVerificationStatus: z
    .boolean()
    .default(false)
    .refine((data) => data, {
      message: "PAN must be verified",
    }),
});

export type PersonalInformationFormValues = z.infer<typeof PersonalInformationSchema>;

export interface PersonalInformationFormProps {
  initialData?: Partial<PersonalInformationFormValues> & { id?: string };
  loanApplication?: any;
}
