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

export const LoanType = z.enum(["PERSONAL", "VEHICLE", "HOUSE_CONSTRUCTION", "PLOT_PURCHASE", "MORTGAGE"]);

export const LoanStatus = z.enum(["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"]);

export const VerificationType = z.enum(["RESIDENCE", "BUSINESS", "VEHICLE", "PROPERTY"]);

export const VerificationStatus = z.enum(["PENDING", "COMPLETED", "FAILED"]);

// UserProfile Schema
export const UserProfileSchema = z.object({
  id: z.string(),
  authId: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  isOnboarded: z.boolean().default(false),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

export const UserRolesSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: RoleType,
  bankId: z.string().nullable(),
  assignedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

// Applicant Schema
export const ApplicantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dateOfBirth: z.date(),
  addressState: z.string(),
  addressCity: z.string(),
  addressFull: z.string(),
  addressPinCode: z.string(),
  aadharNumber: z.string(),
  panNumber: z.string(),
  aadharVerificationStatus: z.boolean().default(false),
  panVerificationStatus: z.boolean().default(false),
  photoUrl: z.string(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

// Loan Obligation Schema
export const LoanObligationSchema = z.object({
  id: z.string(),
  applicantId: z.string(),
  cibilScore: z.number().nullable(),
  totalLoan: z.number().nullable(),
  totalEmi: z.number().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

export const LoanObligationDetailSchema = z.object({
  id: z.string(),
  loanObligationId: z.string(),
  outstandingLoan: z.number(),
  emiAmount: z.number(),
  loanDate: z.date(),
  loanType: z.string(),
  bankName: z.string(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

// Income Schema
export const IncomeSchema = z.object({
  id: z.string(),
  applicantId: z.string(),
  type: z.string(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

export const IncomeDetailSchema = z.object({
  id: z.string(),
  incomeId: z.string(),
  year: z.number(),
  taxableIncome: z.number().nullable(),
  taxPaid: z.number().nullable(),
  grossIncome: z.number().nullable(),
  rentalIncome: z.number().nullable(),
  incomeFromBusiness: z.number().nullable(),
  depreciation: z.number().nullable(),
  grossCashIncome: z.number().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(),
});

export const DependentSchema = z.object({
  id: z.string(),
  applicantId: z.string(),
  averageMonthlyExpenditure: z.number(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable(,
});

export const BankSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable()
});

export const SubscriptionSchema = z.object({
  id: z.string(),
  bankId: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  status: z.string(),
  amount: z.number(),
  deletedAt: z.date().nullable()
});

export const LoanApplicationSchema = z.object({
  id: z.string(),
  applicantId: z.string(),
  bankId: z.string(),
  loanType: LoanType,
  amountRequested: z.number(),
  status: LoanStatus,
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable()
});

export const DocumentSchema = z.object({
  id: z.string(),
  loanApplicationId: z.string(),
  documentType: z.string(),
  fileUrl: z.string(),
  storageType: z.string(),
  verificationStatus: VerificationStatus,
  metadata: z.any().nullable(),
  uploadedAt: z.date().default(new Date()),
  deletedAt: z.date().nullable()
});

export const AuditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  tableName: z.string(),
  userId: z.string(),
  recordId: z.string().nullable(),
  timestamp: z.date().default(new Date()),
  oldData: z.any().nullable(),
  newData: z.any().nullable(),
  ipAddress: z.string().nullable(),
  deviceInfo: z.string().nullable(),
});
