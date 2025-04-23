import { z } from "zod";

/**
 * Schema for creating a new CoApplicant
 * Contains all required fields with validation rules
 */
export const createCoApplicantSchema = z.object({
  firstName: z.string().min(1, { message: "validation.firstName.required" }),
  lastName: z.string().min(1, { message: "validation.lastName.required" }),
  email: z.string().email({ message: "validation.email.invalid" }),
  addressState: z.string().min(1, { message: "validation.addressState.required" }),
  addressCity: z.string().min(1, { message: "validation.addressCity.required" }),
  addressZipCode: z.string().min(1, { message: "validation.addressZipCode.required" }),
  addressLine1: z.string().min(1, { message: "validation.addressLine1.required" }),
  addressLine2: z.string().optional(),
  mobileNumber: z.string().min(10, { message: "validation.mobileNumber.invalid" }),
  loanApplicationId: z.string().min(1, { message: "validation.loanApplicationId.required" }),
});

/**
 * Schema for updating an existing CoApplicant
 * Extends the create schema with ID and makes all fields optional
 */
export const updateCoApplicantSchema = createCoApplicantSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
  })
  .partial();

/**
 * Schema for API validation
 * Uses strict mode to prevent unknown fields
 */
export const coApplicantApiSchema = createCoApplicantSchema.strict();

/**
 * Schema for viewing CoApplicant data
 * Includes all fields from the database plus derived/formatted fields
 */
export const coApplicantViewSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  addressState: z.string(),
  addressCity: z.string(),
  addressZipCode: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable().optional(),
  mobileNumber: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  loanApplicationId: z.string(),
  formattedCreatedAt: z.string().optional(), // Derived field for formatted date
  formattedUpdatedAt: z.string().optional(), // Derived field for formatted date
  fullName: z.string().optional(), // Derived field for full name
  fullAddress: z.string().optional(), // Derived field for full address
});

// Inferred types
export type CreateCoApplicantInput = z.infer<typeof createCoApplicantSchema>;
export type UpdateCoApplicantInput = z.infer<typeof updateCoApplicantSchema>;
export type CoApplicantView = z.infer<typeof coApplicantViewSchema>;
