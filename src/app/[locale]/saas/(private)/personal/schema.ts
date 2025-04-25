import { z } from "zod";
import { createApplicantSchema } from "@/app/[locale]/saas/(private)/applicant/schemas/applicantSchema";

/**
 * Schema for Applicant Personal Information form
 * Extends the base createApplicantSchema while maintaining the validation structure
 */
export const PersonalInformationSchema = createApplicantSchema.extend({
  id: z.string().uuid(),
  dateOfBirth: z.coerce.date().refine(
    (date) => {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      return date <= eighteenYearsAgo;
    },
    { message: "validation.dateOfBirth.ageRequirement" },
  ),
  addressState: z.string().min(1, { message: "validation.addressState.required" }),
  addressCity: z.string().min(1, { message: "validation.addressCity.required" }),
  addressFull: z.string().min(1, { message: "validation.addressFull.required" }),
  addressPinCode: z.string().regex(/^\d{6}$/, { message: "validation.addressPinCode.format" }),
  aadharNumber: z
    .string()
    .regex(/^\d{12}$/, { message: "validation.aadharNumber.format" })
    .refine(
      (aadhar) => {
        const digits = aadhar.split("").map(Number);
        return digits.length === 12;
      },
      { message: "validation.aadharNumber.invalid" },
    ),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "validation.panNumber.format" }),
  aadharVerificationStatus: z
    .boolean()
    .default(false)
    .refine((data) => data, {
      message: "validation.aadharVerificationStatus.required",
    }),
  panVerificationStatus: z
    .boolean()
    .default(false)
    .refine((data) => data, {
      message: "validation.panVerificationStatus.required",
    }),
});

export type PersonalInformationFormValues = z.infer<typeof PersonalInformationSchema>;

export interface PersonalInformationFormProps {
  initialData?: Partial<PersonalInformationFormValues>;
  loanApplication?: any;
}
