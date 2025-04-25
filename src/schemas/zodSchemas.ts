// Deprecated -- Do not use this file.

import { z } from "zod";

// Enums
export const RoleType = z.enum([
  "CLERK",
  "INSPECTOR",
  "LOAN_OFFICER",
  "CEO",
  "LOAN_COMMITTEE",
  "BOARD",
  "BANK_ADMIN",
  "SAAS_ADMIN",
  "APPLICANT",
  "USER",
]);

export const LoanType = z.enum([
  "PERSONAL",
  "VEHICLE",
  "HOUSE_CONSTRUCTION",
  "PLOT_PURCHASE",
  "MORTGAGE",
  "PLOT_AND_HOUSE_CONSTRUCTION",
]);

export const LoanStatus = z.enum(["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"]);

export const VerificationType = z.enum(["RESIDENCE", "BUSINESS", "VEHICLE", "PROPERTY"]);

export const DocumentType = z.enum([
  "AADHAAR_CARD",
  "PAN_CARD",
  "IDENTITY_PROOF",
  "ADDRESS_PROOF",
  "INCOME_PROOF",
  "BANK_STATEMENT",
  "PROPERTY_DOCUMENT",
  "VEHICLE_DOCUMENT",
  "LOAN_AGREEMENT",
  "VERIFICATION_PHOTO",
  "KYC_DOCUMENT",
  "APPLICATION_FORM",
  "OTHER",
]);

export const VerificationStatus = z.enum(["PENDING", "COMPLETED", "FAILED"]);

// Utility function for phone number validation
const phoneNumberValidation = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number cannot exceed 15 digits")
  .regex(/^\d+$/, "Phone number must contain only digits");

// Utility function for email validation
const emailValidation = z.string().email("Invalid email address").min(1, "Email is required");

// UserProfile Schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  authId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required").max(100).nullable(),
  lastName: z.string().min(1, "Last name is required").max(100).nullable(),
  email: emailValidation.nullable(),
  phoneNumber: phoneNumberValidation.nullable(),
  isOnboarded: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),
});

// UserRoles Schema
export const UserRolesSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  role: RoleType,
  bankId: z.string().uuid().nullable(),
  assignedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),
});

// Applicant Schema
export const ApplicantSchema = z.object({
  userId: z.string().uuid(),
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
        // Basic Aadhar validation (can be enhanced)
        const digits = aadhar.split("").map(Number);
        return digits.length === 12;
      },
      { message: "Invalid Aadhar number" },
    ),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "PAN must be valid format (e.g., ABCDE1234F)"),
  aadharVerificationStatus: z.boolean().default(false),
  panVerificationStatus: z.boolean().default(false),
  photoUrl: z.string().url().optional(),
});

// Loan Obligation Schema
export const LoanObligationSchema = z.object({
  id: z.string().uuid(),
  applicantId: z.string().uuid(),
  cibilScore: z.number().min(300, "CIBIL score too low").max(900, "CIBIL score cannot exceed 900").nullable(),
  totalLoan: z.number().nonnegative().nullable(),
  totalEmi: z.number().nonnegative().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),
});

export const LoanObligationDetailSchema = z.object({
  id: z.string().uuid(),
  loanObligationId: z.string().uuid(),
  outstandingLoan: z.number().nonnegative(),
  emiAmount: z.number().positive(),
  loanDate: z.date(),
  loanType: z.string().min(1, "Loan type is required"),
  bankName: z.string().min(1, "Bank name is required"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),
});

// Income Schema
export const IncomeSchema = z.object({
  id: z.string().uuid(),
  applicantId: z.string().uuid(),
  type: z.string().min(1, "Income type is required"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),
});

export const IncomeDetailSchema = z.object({
  id: z.string().uuid(),
  incomeId: z.string().uuid(),
  year: z.number().min(1900, "Year must be after 1900").max(new Date().getFullYear(), "Year cannot be in the future"),
  taxableIncome: z.number().nonnegative().nullable(),
  taxPaid: z.number().nonnegative().nullable(),
  grossIncome: z.number().nonnegative().nullable(),
  rentalIncome: z.number().nonnegative().nullable(),
  incomeFromBusiness: z.number().nonnegative().nullable(),
  depreciation: z.number().nonnegative().nullable(),
  grossCashIncome: z.number().nonnegative().nullable(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),
});

export const DependentSchema = z.object({
  id: z.string().uuid(),
  applicantId: z.string().uuid(),
  averageMonthlyExpenditure: z.number().nonnegative(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),
});

export const BankSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Bank name must be at least 3 characters"),
  officialEmail: z.string().email("Official email must be a valid email address"),
  contactNumber: z.string().optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  legalEntityName: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  regulatoryLicenses: z.record(z.any()).optional(),
  onboardingStatus: z
    .enum([
      "BANK_CREATED",
      "BANK_DETAILS_ADDED",
      "BANK_ONBOARDED",
      "ADMIN_CREATED",
      "SUBSCRIPTION_CREATED",
      "USERS_CREATED",
      "CONFIGURATIONS_CREATED",
    ])
    .default("BANK_CREATED")
    .optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),
});

export const SubscriptionSchema = z.object({
  id: z.string().uuid().optional(),
  bankId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  status: z.string().min(1, "Subscription status is required"),
  amount: z.number().positive("Subscription amount must be positive"),
  deletedAt: z.date().nullable(),
});

export const GuarantorSchema = z.object({
  loanApplicationId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailValidation,
  addressState: z.string().min(1, "State is required"),
  addressCity: z.string().min(1, "City is required"),
  addressZipCode: z.string().regex(/^\d{6}$/, "ZIP code must be 6 digits"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  mobileNumber: phoneNumberValidation,
});

export const CoApplicantSchema = z.object({
  loanApplicationId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailValidation,
  addressState: z.string().min(1, "State is required"),
  addressCity: z.string().min(1, "City is required"),
  addressZipCode: z.string().regex(/^\d{6}$/, "ZIP code must be 6 digits"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  mobileNumber: phoneNumberValidation,
});

export const LoanApplicationSchema = z.object({
  id: z.string().uuid().optional(),
  applicantId: z.string().uuid(),
  bankId: z.string().uuid(),
  loanType: LoanType,
  amountRequested: z
    .number()
    .positive("Loan amount must be positive")
    .max(10000000, "Loan amount exceeds maximum limit"),
  guarantors: z.array(GuarantorSchema).max(2, "Maximum of 2 guarantors allowed").optional(),
  coApplicants: z.array(CoApplicantSchema).max(2, "Maximum of 2 co-applicants allowed").optional(),
  status: LoanStatus,
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),
});

// Initial loan application form schema
export const InitialLoanApplicationSchema = z.object({
  loanType: z.enum(["PERSONAL", "VEHICLE", "HOUSE_CONSTRUCTION", "PLOT_PURCHASE", "MORTGAGE"]),
  requestedAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a valid positive number",
  }),
  bankId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  email: z.string().email("Invalid email address"),
});

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  documentType: DocumentType,
  fileUrl: z.string().url("Invalid file URL"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().nonnegative("File size must be non-negative"),
  mimeType: z.string().min(1, "MIME type is required"),
  storageType: z.string().min(1, "Storage type is required"),
  status: VerificationStatus,
  metadata: z.record(z.any()).nullable(),
  uploadedById: z.string().uuid(),
  uploadedAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable(),

  // Optional relations
  loanApplicationId: z.string().uuid().optional(),
  applicantId: z.string().uuid().optional(),
  coApplicantId: z.string().uuid().optional(),
  guarantorId: z.string().uuid().optional(),
  incomeId: z.string().uuid().optional(),
  incomeDetailId: z.string().uuid().optional(),
  dependentId: z.string().uuid().optional(),
  loanObligationId: z.string().uuid().optional(),
  loanObligationDetailId: z.string().uuid().optional(),
  bankId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  bankConfigurationId: z.string().uuid().optional(),
});

// Verification-related Schemas
export const ResidenceVerificationSchema = z.object({
  ownerFirstName: z.string().optional(),
  ownerLastName: z.string().optional(),
  residentSince: z.string().optional(),
  residenceType: z.string().optional(),
  structureType: z.string().optional(),
});

export const BusinessVerificationSchema = z.object({
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  contactDetails: z.string().optional(),
  businessExistence: z.boolean().optional(),
  natureOfBusiness: z.string().optional(),
  salesPerDay: z.string().optional(),
});

export const PropertyVerificationSchema = z.object({
  ownerFirstName: z.string().optional(),
  ownerLastName: z.string().optional(),
  structureType: z.string().optional(),
});

export const VehicleVerificationSchema = z.object({
  engineNumber: z.string().optional(),
  chassisNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  vehicleType: z.string().optional(),
  taxInvoiceUrl: z.string().url().optional(),
  deliveryChalanUrl: z.string().url().optional(),
  stampedReceiptUrl: z.string().url().optional(),
  rcUrl: z.string().url().optional(),
  inspectionReportUrl: z.string().url().optional(),
  vehiclePhotoUrl: z.string().url().optional(),
});

export const VerificationSchema = z.object({
  loanApplicationId: z.string().uuid(),
  type: VerificationType,
  status: VerificationStatus,
  verificationDate: z.coerce.date(),
  verificationTime: z.string().optional(),
  result: z.boolean(),
  remarks: z.string().optional(),
  verifiedById: z.string().uuid().optional(),
  verifiedAt: z.date().optional(),
  addressState: z.string().optional(),
  addressCity: z.string().optional(),
  addressZipCode: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  locationFromMain: z.string().optional(),
  photographUrl: z.string().optional(),

  // Related type-specific verification data
  residenceVerification: ResidenceVerificationSchema.optional(),
  businessVerification: BusinessVerificationSchema.optional().nullable(),
  propertyVerification: PropertyVerificationSchema.optional().nullable(),
  vehicleVerification: VehicleVerificationSchema.optional().nullable(),
});

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  action: z.string().min(1, "Action is required"),
  tableName: z.string().min(1, "Table name is required"),
  userId: z.string().uuid(),
  recordId: z.string().uuid().nullable(),
  timestamp: z.date().default(() => new Date()),
  oldData: z.any().nullable(),
  newData: z.any().nullable(),
  ipAddress: z.string().ip().nullable(),
  deviceInfo: z.string().optional(),
});
