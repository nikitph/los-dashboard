import { prisma } from "@/lib/prisma/prisma";
import { z } from "zod";
import {
  ApplicantSchema,
  AuditLogSchema,
  BankSchema,
  DependentSchema,
  DocumentSchema,
  IncomeDetailSchema,
  IncomeSchema,
  LoanApplicationSchema,
  LoanObligationDetailSchema,
  LoanObligationSchema,
  SubscriptionSchema,
  UserProfileSchema,
  UserRolesSchema,
} from "@/schemas/zodSchemas";

const UUIDSchema = z.string().uuid();

// ==================== USER UTILITIES ====================
const CreateUserSchema = UserProfileSchema.omit({ id: true, createdAt: true, updatedAt: true });
const UpdateUserSchema = CreateUserSchema.partial();

export const createUser = async (data: z.infer<typeof CreateUserSchema>) => {
  const validatedData = CreateUserSchema.parse(data);
  return prisma.userProfile.create({ data: validatedData });
};

export const getUserById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.userProfile.findUnique({ where: { id } });
};

export const updateUser = async (id: string, data: z.infer<typeof UpdateUserSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateUserSchema.parse(data);
  return prisma.userProfile.update({ where: { id }, data: validatedData });
};

export const deleteUser = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.userProfile.delete({ where: { id } });
};

export const listUsers = async () => prisma.userProfile.findMany();

// ==================== APPLICANT UTILITIES ====================
const CreateApplicantSchema = ApplicantSchema.omit({ id: true, createdAt: true, updatedAt: true });
const UpdateApplicantSchema = CreateApplicantSchema.partial();

export const createApplicant = async (data: z.infer<typeof CreateApplicantSchema>) => {
  const validatedData = CreateApplicantSchema.parse(data);
  return prisma.applicant.create({ data: validatedData });
};

export const getApplicantById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.applicant.findUnique({ where: { id } });
};

export const updateApplicant = async (id: string, data: z.infer<typeof UpdateApplicantSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateApplicantSchema.parse(data);
  return prisma.applicant.update({ where: { id }, data: validatedData });
};

export const deleteApplicant = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.applicant.delete({ where: { id } });
};

export const listApplicants = async () => prisma.applicant.findMany();

// ==================== LOAN OBLIGATION UTILITIES ====================
const CreateLoanObligationSchema = LoanObligationSchema.omit({ id: true, createdAt: true, updatedAt: true });
const UpdateLoanObligationSchema = CreateLoanObligationSchema.partial();

export const createLoanObligation = async (data: z.infer<typeof CreateLoanObligationSchema>) => {
  const validatedData = CreateLoanObligationSchema.parse(data);
  return prisma.loanObligation.create({ data: validatedData });
};

export const getLoanObligationById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.loanObligation.findUnique({ where: { id } });
};

export const updateLoanObligation = async (id: string, data: z.infer<typeof UpdateLoanObligationSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateLoanObligationSchema.parse(data);
  return prisma.loanObligation.update({ where: { id }, data: validatedData });
};

export const deleteLoanObligation = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.loanObligation.delete({ where: { id } });
};

export const listLoanObligations = async () => prisma.loanObligation.findMany();

// ==================== BANK UTILITIES ====================
const CreateBankSchema = BankSchema.omit({ id: true, createdAt: true, updatedAt: true });
const UpdateBankSchema = CreateBankSchema.partial();

export const createBank = async (data: z.infer<typeof CreateBankSchema>) => {
  const validatedData = CreateBankSchema.parse(data);
  return prisma.bank.create({ data: validatedData });
};

export const getBankById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.bank.findUnique({ where: { id } });
};

export const updateBank = async (id: string, data: z.infer<typeof UpdateBankSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateBankSchema.parse(data);
  return prisma.bank.update({ where: { id }, data: validatedData });
};

export const deleteBank = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.bank.delete({ where: { id } });
};

export const listBanks = async () => prisma.bank.findMany();

// ==================== AUDIT LOG UTILITIES ====================
const CreateAuditLogSchema = AuditLogSchema.omit({ id: true, timestamp: true });
const UpdateAuditLogSchema = CreateAuditLogSchema.partial();

export const createAuditLog = async (data: z.infer<typeof CreateAuditLogSchema>) => {
  const validatedData = CreateAuditLogSchema.parse(data);
  return prisma.auditLog.create({ data: validatedData });
};

export const getAuditLogById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.auditLog.findUnique({ where: { id } });
};

export const updateAuditLog = async (id: string, data: z.infer<typeof UpdateAuditLogSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateAuditLogSchema.parse(data);
  return prisma.auditLog.update({ where: { id }, data: validatedData });
};

export const deleteAuditLog = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.auditLog.delete({ where: { id } });
};

export const listAuditLogs = async () => prisma.auditLog.findMany();

// ==================== DOCUMENT UTILITIES ====================
const CreateDocumentSchema = DocumentSchema.omit({ id: true, uploadedAt: true });
const UpdateDocumentSchema = CreateDocumentSchema.partial();

export const createDocument = async (data: z.infer<typeof CreateDocumentSchema>) => {
  const validatedData = CreateDocumentSchema.parse(data);
  return prisma.document.create({ data: validatedData });
};

export const getDocumentById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.document.findUnique({ where: { id } });
};

export const updateDocument = async (id: string, data: z.infer<typeof UpdateDocumentSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateDocumentSchema.parse(data);
  return prisma.document.update({ where: { id }, data: validatedData });
};

export const deleteDocument = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.document.delete({ where: { id } });
};

export const listDocuments = async () => prisma.document.findMany();

// ==================== INCOME UTILITIES ====================
const CreateIncomeSchema = IncomeSchema.omit({ id: true, createdAt: true, updatedAt: true });
const UpdateIncomeSchema = CreateIncomeSchema.partial();

export const createIncome = async (data: z.infer<typeof CreateIncomeSchema>) => {
  const validatedData = CreateIncomeSchema.parse(data);
  return prisma.income.create({ data: validatedData });
};

export const getIncomeById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.income.findUnique({ where: { id } });
};

export const updateIncome = async (id: string, data: z.infer<typeof UpdateIncomeSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateIncomeSchema.parse(data);
  return prisma.income.update({ where: { id }, data: validatedData });
};

export const deleteIncome = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.income.delete({ where: { id } });
};

export const listIncomes = async () => prisma.income.findMany();

// ==================== INCOME DETAIL UTILITIES ====================
const CreateIncomeDetailSchema = IncomeDetailSchema.omit({ id: true, createdAt: true, updatedAt: true });
const UpdateIncomeDetailSchema = CreateIncomeDetailSchema.partial();

export const createIncomeDetail = async (data: z.infer<typeof CreateIncomeDetailSchema>) => {
  const validatedData = CreateIncomeDetailSchema.parse(data);
  return prisma.incomeDetail.create({ data: validatedData });
};

export const getIncomeDetailById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.incomeDetail.findUnique({ where: { id } });
};

export const updateIncomeDetail = async (id: string, data: z.infer<typeof UpdateIncomeDetailSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateIncomeDetailSchema.parse(data);
  return prisma.incomeDetail.update({ where: { id }, data: validatedData });
};

export const deleteIncomeDetail = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.incomeDetail.delete({ where: { id } });
};

export const listIncomeDetails = async () => prisma.incomeDetail.findMany();

// ==================== LOAN APPLICATION UTILITIES ====================
const CreateLoanApplicationSchema = LoanApplicationSchema.omit({ id: true, createdAt: true, updatedAt: true });
const UpdateLoanApplicationSchema = CreateLoanApplicationSchema.partial();

export const createLoanApplication = async (data: z.infer<typeof CreateLoanApplicationSchema>) => {
  const validatedData = CreateLoanApplicationSchema.parse(data);
  return prisma.loanApplication.create({ data: validatedData });
};

export const getLoanApplicationById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.loanApplication.findUnique({ where: { id } });
};

export const updateLoanApplication = async (id: string, data: z.infer<typeof UpdateLoanApplicationSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateLoanApplicationSchema.parse(data);
  return prisma.loanApplication.update({ where: { id }, data: validatedData });
};

export const deleteLoanApplication = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.loanApplication.delete({ where: { id } });
};

export const listLoanApplications = async () => prisma.loanApplication.findMany();

// ==================== LOAN OBLIGATION DETAIL UTILITIES ====================
const CreateLoanObligationDetailSchema = LoanObligationDetailSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
const UpdateLoanObligationDetailSchema = CreateLoanObligationDetailSchema.partial();

export const createLoanObligationDetail = async (data: z.infer<typeof CreateLoanObligationDetailSchema>) => {
  const validatedData = CreateLoanObligationDetailSchema.parse(data);
  return prisma.loanObligationDetail.create({ data: validatedData });
};

export const getLoanObligationDetailById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.loanObligationDetail.findUnique({ where: { id } });
};

export const updateLoanObligationDetail = async (
  id: string,
  data: z.infer<typeof UpdateLoanObligationDetailSchema>,
) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateLoanObligationDetailSchema.parse(data);
  return prisma.loanObligationDetail.update({ where: { id }, data: validatedData });
};

export const deleteLoanObligationDetail = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.loanObligationDetail.delete({ where: { id } });
};

export const listLoanObligationDetails = async () => prisma.loanObligationDetail.findMany();

// ==================== USER ROLES UTILITIES ====================
const CreateUserRolesSchema = UserRolesSchema.omit({ id: true, assignedAt: true });
const UpdateUserRolesSchema = CreateUserRolesSchema.partial();

export const createUserRole = async (data: z.infer<typeof CreateUserRolesSchema>) => {
  const validatedData = CreateUserRolesSchema.parse(data);
  return prisma.userRoles.create({ data: validatedData });
};

export const getUserRoleById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.userRoles.findUnique({ where: { id } });
};

export const updateUserRole = async (id: string, data: z.infer<typeof UpdateUserRolesSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateUserRolesSchema.parse(data);
  return prisma.userRoles.update({ where: { id }, data: validatedData });
};

export const deleteUserRole = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.userRoles.delete({ where: { id } });
};

export const listUserRoles = async () => prisma.userRoles.findMany();

// ==================== SUBSCRIPTION UTILITIES ====================
const CreateSubscriptionSchema = SubscriptionSchema.omit({ id: true });
const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial();

export const createSubscription = async (data: z.infer<typeof CreateSubscriptionSchema>) => {
  const validatedData = CreateSubscriptionSchema.parse(data);
  return prisma.subscription.create({ data: validatedData });
};

export const getSubscriptionById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.subscription.findUnique({ where: { id } });
};

export const updateSubscription = async (id: string, data: z.infer<typeof UpdateSubscriptionSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateSubscriptionSchema.parse(data);
  return prisma.subscription.update({ where: { id }, data: validatedData });
};

export const deleteSubscription = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.subscription.delete({ where: { id } });
};

export const listSubscriptions = async () => prisma.subscription.findMany();

// ==================== DEPENDENT UTILITIES ====================
const CreateDependentSchema = DependentSchema.omit({ id: true, createdAt: true, updatedAt: true });
const UpdateDependentSchema = CreateDependentSchema.partial();

export const createDependent = async (data: z.infer<typeof CreateDependentSchema>) => {
  const validatedData = CreateDependentSchema.parse(data);
  return prisma.dependent.create({ data: validatedData });
};

export const getDependentById = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.dependent.findUnique({ where: { id } });
};

export const updateDependent = async (id: string, data: z.infer<typeof UpdateDependentSchema>) => {
  UUIDSchema.parse(id);
  const validatedData = UpdateDependentSchema.parse(data);
  return prisma.dependent.update({ where: { id }, data: validatedData });
};

export const deleteDependent = async (id: string) => {
  UUIDSchema.parse(id);
  return prisma.dependent.delete({ where: { id } });
};

export const listDependents = async () => prisma.dependent.findMany();
