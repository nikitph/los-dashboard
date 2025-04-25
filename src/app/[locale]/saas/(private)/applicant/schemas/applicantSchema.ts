import { z } from "zod";

/**
 * Schema for creating a new applicant
 * Defines validation rules and error messages for applicant creation
 */
export const createApplicantSchema = z.object({
  userId: z.string().min(1, { message: "validation.userId.required" }),
  dateOfBirth: z.date().nullable().optional(),
  addressState: z.string().nullable().optional(),
  addressCity: z.string().nullable().optional(),
  addressFull: z.string().nullable().optional(),
  addressPinCode: z.string().nullable().optional(),
  aadharNumber: z.string().nullable().optional(),
  panNumber: z.string().nullable().optional(),
  aadharVerificationStatus: z.boolean().default(false),
  panVerificationStatus: z.boolean().default(false),
  photoUrl: z.string().nullable().optional(),
  bankId: z.string().min(1, { message: "validation.bankId.required" }),
});

/**
 * Schema for updating an existing applicant
 * Extends the create schema with ID and makes all fields optional
 */
export const updateApplicantSchema = createApplicantSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
  })
  .partial();

/**
 * Schema for API validation
 * Strictly validates input for API endpoints
 */
export const applicantApiSchema = createApplicantSchema.strict();

/**
 * Schema for viewing applicant data
 * Includes all fields including computed/derived fields
 */
export const applicantViewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  dateOfBirth: z.date().nullable(),
  addressState: z.string().nullable(),
  addressCity: z.string().nullable(),
  addressFull: z.string().nullable(),
  addressPinCode: z.string().nullable(),
  aadharNumber: z.string().nullable(),
  panNumber: z.string().nullable(),
  aadharVerificationStatus: z.boolean(),
  panVerificationStatus: z.boolean(),
  photoUrl: z.string().nullable(),
  deletedAt: z.date().nullable(),
  bankId: z.string(),
  formattedCreatedAt: z.string().optional(), // Derived field for display
  formattedDateOfBirth: z.string().optional(), // Derived field for display
  fullAddress: z.string().optional(), // Derived field combining address components
  verificationStatus: z.string().optional(), // Derived field indicating overall verification status
  fullName: z.string().optional(), // Derived field from related user profile
});

// Inferred types
export type CreateApplicantInput = z.infer<typeof createApplicantSchema>;
export type UpdateApplicantInput = z.infer<typeof updateApplicantSchema>;
export type ApplicantView = z.infer<typeof applicantViewSchema>;
