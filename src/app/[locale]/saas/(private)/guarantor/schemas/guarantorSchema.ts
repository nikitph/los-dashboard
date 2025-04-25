import { z } from "zod";

/**
 * Schema for creating a new guarantor
 * Contains validation with translation keys for error messages
 */
export const createGuarantorSchema = z.object({
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
 * Schema for updating an existing guarantor
 * Extends the create schema with id and makes all fields optional for partial updates
 */
export const updateGuarantorSchema = createGuarantorSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
  })
  .partial();

/**
 * API schema for guarantor validation
 * Uses strict validation to prevent unknown fields
 */
export const guarantorApiSchema = createGuarantorSchema.strict();

/**
 * View schema for guarantor display
 * Includes all fields including read-only and derived fields
 */
export const guarantorViewSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  addressState: z.string(),
  addressCity: z.string(),
  addressZipCode: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional().nullable(),
  mobileNumber: z.string(),
  loanApplicationId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional().nullable(),
  fullName: z.string(), // Derived field
  fullAddress: z.string(), // Derived field
});

// Inferred types
export type CreateGuarantorInput = z.infer<typeof createGuarantorSchema>;
export type UpdateGuarantorInput = z.infer<typeof updateGuarantorSchema>;
export type GuarantorView = z.infer<typeof guarantorViewSchema>;

export type GuarantorFormValues = Omit<CreateGuarantorInput, "id"> & {
  id?: string;
};
