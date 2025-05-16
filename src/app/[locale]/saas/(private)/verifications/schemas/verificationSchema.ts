import { z } from "zod";

/**
 * Schema for verification types
 * Maps to VerificationType enum in Prisma
 */
export const VerificationType = z.enum(["RESIDENCE", "BUSINESS", "VEHICLE", "PROPERTY"]);

/**
 * Schema for verification statuses
 * Maps to VerificationStatus enum in Prisma
 */
export const VerificationStatus = z.enum(["PENDING", "COMPLETED", "FAILED"]);

/**
 * Schema for residence types
 * Maps to ResidenceType enum in Prisma
 */
export const ResidenceType = z.enum(["OWNED", "RENTED"]);

/**
 * Schema for structure types
 * Maps to StructureType enum in Prisma
 */
export const StructureType = z.enum(["DUPLEX", "APARTMENT", "BUNGALOW"]);

/**
 * Schema for creating a new verification record
 * Contains validation with translation keys for error messages
 */
export const createVerificationSchema = z.object({
  loanApplicationId: z.string().min(1, { message: "validation.loanApplicationId.required" }),
  type: VerificationType,
  status: VerificationStatus.default("PENDING"),
  result: z.boolean().default(false),
  remarks: z.string().optional(),
  verificationDate: z.date().default(() => new Date()),
  verificationTime: z.string().min(1, { message: "validation.verificationTime.required" }),
});

/**
 * Schema for creating a new residence verification
 */
export const createResidenceVerificationSchema = z.object({
  ownerFirstName: z.string().min(1, { message: "validation.ownerFirstName.required" }),
  ownerLastName: z.string().min(1, { message: "validation.ownerLastName.required" }),
  residentSince: z.string().optional(),
  residenceType: ResidenceType,
  structureType: StructureType,
  addressCity: z.string().min(1, { message: "validation.addressCity.required" }),
  addressLine1: z.string().min(1, { message: "validation.addressLine1.required" }),
  addressLine2: z.string().optional(),
  addressState: z.string().min(1, { message: "validation.addressState.required" }),
  addressZipCode: z.string().min(1, { message: "validation.addressZipCode.required" }),
  locationFromMain: z.string().min(1, { message: "validation.locationFromMain.required" }),
});

/**
 * Schema for creating a new business verification
 */
export const createBusinessVerificationSchema = z.object({
  businessName: z.string().min(1, { message: "validation.businessName.required" }),
  businessType: z.string().min(1, { message: "validation.businessType.required" }),
  addressCity: z.string().min(1, { message: "validation.addressCity.required" }),
  addressLine1: z.string().min(1, { message: "validation.addressLine1.required" }),
  addressLine2: z.string().optional(),
  addressState: z.string().min(1, { message: "validation.addressState.required" }),
  addressZipCode: z.string().min(1, { message: "validation.addressZipCode.required" }),
  locationFromMain: z.string().min(1, { message: "validation.locationFromMain.required" }),
  contactDetails: z.string().min(1, { message: "validation.contactDetails.required" }),
  businessExistence: z.boolean(),
  natureOfBusiness: z.string().min(1, { message: "validation.natureOfBusiness.required" }),
  salesPerDay: z.string().min(1, { message: "validation.salesPerDay.required" }),
});

/**
 * Schema for creating a new property verification
 */
export const createPropertyVerificationSchema = z.object({
  ownerFirstName: z.string().min(1, { message: "validation.ownerFirstName.required" }),
  ownerLastName: z.string().min(1, { message: "validation.ownerLastName.required" }),
  structureType: z.string().min(1, { message: "validation.structureType.required" }),
  addressCity: z.string().min(1, { message: "validation.addressCity.required" }),
  addressLine1: z.string().min(1, { message: "validation.addressLine1.required" }),
  addressLine2: z.string().optional(),
  addressState: z.string().min(1, { message: "validation.addressState.required" }),
  addressZipCode: z.string().min(1, { message: "validation.addressZipCode.required" }),
  locationFromMain: z.string().min(1, { message: "validation.locationFromMain.required" }),
});

/**
 * Schema for creating a new vehicle verification
 */
export const createVehicleVerificationSchema = z.object({
  engineNumber: z.string().optional(),
  chassisNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  make: z.string().min(1, { message: "validation.make.required" }),
  model: z.string().min(1, { message: "validation.model.required" }),
  vehicleType: z.string().optional(),
});

/**
 * Combined schema for creating a verification with its specific type data
 */
export const createFullVerificationSchema = z
  .object({
    verification: createVerificationSchema,
    residenceVerification: createResidenceVerificationSchema.optional(),
    businessVerification: createBusinessVerificationSchema.optional(),
    propertyVerification: createPropertyVerificationSchema.optional(),
    vehicleVerification: createVehicleVerificationSchema.optional(),
  })
  .refine(
    (data) => {
      // Ensure that the correct verification type data is provided
      const type = data.verification.type;
      if (type === "RESIDENCE" && !data.residenceVerification) {
        return false;
      }
      if (type === "BUSINESS" && !data.businessVerification) {
        return false;
      }
      if (type === "PROPERTY" && !data.propertyVerification) {
        return false;
      }
      if (type === "VEHICLE" && !data.vehicleVerification) {
        return false;
      }
      return true;
    },
    {
      message: "validation.verificationType.mismatch",
      path: ["verification", "type"],
    },
  );

/**
 * Schema for updating an existing verification
 * Extends the create schema with id and makes all fields optional for partial updates
 */
export const updateVerificationSchema = createVerificationSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
  })
  .partial();

/**
 * Schema for updating residence verification
 */
export const updateResidenceVerificationSchema = createResidenceVerificationSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
    verificationId: z.string().min(1, { message: "validation.verificationId.required" }),
  })
  .partial();

/**
 * Schema for updating business verification
 */
export const updateBusinessVerificationSchema = createBusinessVerificationSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
    verificationId: z.string().min(1, { message: "validation.verificationId.required" }),
  })
  .partial();

/**
 * Schema for updating property verification
 */
export const updatePropertyVerificationSchema = createPropertyVerificationSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
    verificationId: z.string().min(1, { message: "validation.verificationId.required" }),
  })
  .partial();

/**
 * Schema for updating vehicle verification
 */
export const updateVehicleVerificationSchema = createVehicleVerificationSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
    verificationId: z.string().min(1, { message: "validation.verificationId.required" }),
  })
  .partial();

/**
 * Combined schema for updating a verification with its specific type data
 */
export const updateFullVerificationSchema = z.object({
  verification: updateVerificationSchema,
  residenceVerification: updateResidenceVerificationSchema.optional(),
  businessVerification: updateBusinessVerificationSchema.optional(),
  propertyVerification: updatePropertyVerificationSchema.optional(),
  vehicleVerification: updateVehicleVerificationSchema.optional(),
});

/**
 * API schema for verification validation
 * Uses strict validation to prevent unknown fields
 */
export const verificationApiSchema = createVerificationSchema.strict();

/**
 * View schema for verification display
 * Includes all fields including read-only and derived fields
 */
export const verificationViewSchema = z.object({
  id: z.string(),
  loanApplicationId: z.string(),
  type: VerificationType,
  status: VerificationStatus,
  verifiedById: z.string().optional().nullable(),
  createdAt: z.date(),
  deletedAt: z.date().optional().nullable(),
  remarks: z.string().optional().nullable(),
  result: z.boolean(),
  updatedAt: z.date(),
  verificationDate: z.date(),
  verificationTime: z.string(),
  formattedVerificationDate: z.string(), // Derived field
  statusDisplay: z.string(), // Derived field
  typeDisplay: z.string(), // Derived field
  verifierName: z.string().optional(), // Derived field
});

/**
 * View schema for residence verification display
 */
export const residenceVerificationViewSchema = z.object({
  id: z.string(),
  verificationId: z.string(),
  ownerFirstName: z.string(),
  ownerLastName: z.string(),
  residentSince: z.string().optional().nullable(),
  residenceType: ResidenceType,
  structureType: StructureType,
  addressCity: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional().nullable(),
  addressState: z.string(),
  addressZipCode: z.string(),
  locationFromMain: z.string(),
  fullName: z.string(), // Derived field
  fullAddress: z.string(), // Derived field
  residenceTypeDisplay: z.string(), // Derived field
  structureTypeDisplay: z.string(), // Derived field
});

/**
 * View schema for business verification display
 */
export const businessVerificationViewSchema = z.object({
  id: z.string(),
  verificationId: z.string(),
  businessName: z.string(),
  businessType: z.string(),
  addressCity: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional().nullable(),
  addressState: z.string(),
  addressZipCode: z.string(),
  locationFromMain: z.string(),
  contactDetails: z.string(),
  businessExistence: z.boolean(),
  natureOfBusiness: z.string(),
  salesPerDay: z.string(),
  fullAddress: z.string(), // Derived field
});

/**
 * View schema for property verification display
 */
export const propertyVerificationViewSchema = z.object({
  id: z.string(),
  verificationId: z.string(),
  ownerFirstName: z.string(),
  ownerLastName: z.string(),
  structureType: z.string(),
  addressCity: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional().nullable(),
  addressState: z.string(),
  addressZipCode: z.string(),
  locationFromMain: z.string(),
  fullName: z.string(), // Derived field
  fullAddress: z.string(), // Derived field
});

/**
 * View schema for vehicle verification display
 */
export const vehicleVerificationViewSchema = z.object({
  id: z.string(),
  verificationId: z.string(),
  engineNumber: z.string().optional().nullable(),
  chassisNumber: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  make: z.string(),
  model: z.string(),
  vehicleType: z.string().optional().nullable(),
  vehicleDescription: z.string(), // Derived field
});

/**
 * Combined view schema for verification with its specific type data
 */
export const fullVerificationViewSchema = z.object({
  verification: verificationViewSchema,
  residenceVerification: residenceVerificationViewSchema.optional().nullable(),
  businessVerification: businessVerificationViewSchema.optional().nullable(),
  propertyVerification: propertyVerificationViewSchema.optional().nullable(),
  vehicleVerification: vehicleVerificationViewSchema.optional().nullable(),
});

// Inferred types
export type CreateVerificationInput = z.infer<typeof createVerificationSchema>;
export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;
export type VerificationView = z.infer<typeof verificationViewSchema>;

export type CreateResidenceVerificationInput = z.infer<typeof createResidenceVerificationSchema>;
export type CreateBusinessVerificationInput = z.infer<typeof createBusinessVerificationSchema>;
export type CreatePropertyVerificationInput = z.infer<typeof createPropertyVerificationSchema>;
export type CreateVehicleVerificationInput = z.infer<typeof createVehicleVerificationSchema>;

export type UpdateResidenceVerificationInput = z.infer<typeof updateResidenceVerificationSchema>;
export type UpdateBusinessVerificationInput = z.infer<typeof updateBusinessVerificationSchema>;
export type UpdatePropertyVerificationInput = z.infer<typeof updatePropertyVerificationSchema>;
export type UpdateVehicleVerificationInput = z.infer<typeof updateVehicleVerificationSchema>;

export type CreateFullVerificationInput = z.infer<typeof createFullVerificationSchema>;
export type UpdateFullVerificationInput = z.infer<typeof updateFullVerificationSchema>;
export type FullVerificationView = z.infer<typeof fullVerificationViewSchema>;

export type ResidenceVerificationView = z.infer<typeof residenceVerificationViewSchema>;
export type BusinessVerificationView = z.infer<typeof businessVerificationViewSchema>;
export type PropertyVerificationView = z.infer<typeof propertyVerificationViewSchema>;
export type VehicleVerificationView = z.infer<typeof vehicleVerificationViewSchema>;

export type VerificationFormValues = CreateFullVerificationInput & {
  verification: CreateVerificationInput & { id?: string };
};

export const RESIDENCE_TYPES = ResidenceType.options;
export const STRUCTURE_TYPES = StructureType.options;
