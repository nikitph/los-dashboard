import { prisma } from "@/lib/prisma"
import {
  AuditLog,
  Bank,
  BankConfiguration,
  Document,
  LoanApplication,
  Permission,
  RoleAssignment,
  Subscription,
  User,
  Verification,
} from "@prisma/client"

// User Utilities
export const createUser = async (
  data: Omit<User, "id" | "createdAt" | "updatedAt">,
) => {
  return prisma.user.create({ data })
}

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({ where: { id } })
}

export const updateUser = async (id: string, data: Partial<User>) => {
  return prisma.user.update({ where: { id }, data })
}

export const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } })
}

export const listUsers = async () => {
  return prisma.user.findMany()
}

// RoleAssignment Utilities
export const createRoleAssignment = async (
  data: Omit<RoleAssignment, "id" | "assignedAt">,
) => {
  return prisma.roleAssignment.create({ data })
}

export const getRoleAssignmentById = async (id: number) => {
  return prisma.roleAssignment.findUnique({ where: { id } })
}

export const updateRoleAssignment = async (
  id: number,
  data: Partial<RoleAssignment>,
) => {
  return prisma.roleAssignment.update({ where: { id }, data })
}

export const deleteRoleAssignment = async (id: number) => {
  return prisma.roleAssignment.delete({ where: { id } })
}

export const listRoleAssignments = async () => {
  return prisma.roleAssignment.findMany()
}

// Permission Utilities
export const createPermission = async (data: Omit<Permission, "id">) => {
  return prisma.permission.create({ data })
}

export const getPermissionById = async (id: number) => {
  return prisma.permission.findUnique({ where: { id } })
}

export const updatePermission = async (
  id: number,
  data: Partial<Permission>,
) => {
  return prisma.permission.update({ where: { id }, data })
}

export const deletePermission = async (id: number) => {
  return prisma.permission.delete({ where: { id } })
}

export const listPermissions = async () => {
  return prisma.permission.findMany()
}

// Bank Utilities
export const createBank = async (
  data: Omit<Bank, "id" | "createdAt" | "updatedAt">,
) => {
  return prisma.bank.create({ data })
}

export const getBankById = async (id: number) => {
  return prisma.bank.findUnique({ where: { id } })
}

export const updateBank = async (id: number, data: Partial<Bank>) => {
  return prisma.bank.update({ where: { id }, data })
}

export const deleteBank = async (id: number) => {
  return prisma.bank.delete({ where: { id } })
}

export const listBanks = async () => {
  return prisma.bank.findMany()
}

// Subscription Utilities
export const createSubscription = async (data: Omit<Subscription, "id">) => {
  return prisma.subscription.create({ data })
}

export const getSubscriptionById = async (id: number) => {
  return prisma.subscription.findUnique({ where: { id } })
}

export const updateSubscription = async (
  id: number,
  data: Partial<Subscription>,
) => {
  return prisma.subscription.update({ where: { id }, data })
}

export const deleteSubscription = async (id: number) => {
  return prisma.subscription.delete({ where: { id } })
}

export const listSubscriptions = async () => {
  return prisma.subscription.findMany()
}

// BankConfiguration Utilities
export const createBankConfiguration = async (
  data: Omit<BankConfiguration, "id">,
) => {
  return prisma.bankConfiguration.create({ data })
}

export const getBankConfigurationById = async (id: number) => {
  return prisma.bankConfiguration.findUnique({ where: { id } })
}

export const updateBankConfiguration = async (
  id: number,
  data: Partial<BankConfiguration>,
) => {
  return prisma.bankConfiguration.update({ where: { id }, data })
}

export const deleteBankConfiguration = async (id: number) => {
  return prisma.bankConfiguration.delete({ where: { id } })
}

export const listBankConfigurations = async () => {
  return prisma.bankConfiguration.findMany()
}

// LoanApplication Utilities
export const createLoanApplication = async (
  data: Omit<LoanApplication, "id" | "createdAt" | "updatedAt">,
) => {
  return prisma.loanApplication.create({ data })
}

export const getLoanApplicationById = async (id: number) => {
  return prisma.loanApplication.findUnique({ where: { id } })
}

export const updateLoanApplication = async (
  id: number,
  data: Partial<LoanApplication>,
) => {
  return prisma.loanApplication.update({ where: { id }, data })
}

export const deleteLoanApplication = async (id: number) => {
  return prisma.loanApplication.delete({ where: { id } })
}

export const listLoanApplications = async () => {
  return prisma.loanApplication.findMany()
}

// Document Utilities
export const createDocument = async (
  data: Omit<Document, "id" | "uploadedAt">,
) => {
  return prisma.document.create({ data })
}

export const getDocumentById = async (id: number) => {
  return prisma.document.findUnique({ where: { id } })
}

export const updateDocument = async (id: number, data: Partial<Document>) => {
  return prisma.document.update({ where: { id }, data })
}

export const deleteDocument = async (id: number) => {
  return prisma.document.delete({ where: { id } })
}

export const listDocuments = async () => {
  return prisma.document.findMany()
}

// Verification Utilities
export const createVerification = async (data: Omit<Verification, "id">) => {
  return prisma.verification.create({ data })
}

export const getVerificationById = async (id: number) => {
  return prisma.verification.findUnique({ where: { id } })
}

export const updateVerification = async (
  id: number,
  data: Partial<Verification>,
) => {
  return prisma.verification.update({ where: { id }, data })
}

export const deleteVerification = async (id: number) => {
  return prisma.verification.delete({ where: { id } })
}

export const listVerifications = async () => {
  return prisma.verification.findMany()
}

// AuditLog Utilities
export const createAuditLog = async (
  data: Omit<AuditLog, "id" | "timestamp">,
) => {
  return prisma.auditLog.create({ data })
}

export const getAuditLogById = async (id: number) => {
  return prisma.auditLog.findUnique({ where: { id } })
}

export const updateAuditLog = async (id: number, data: Partial<AuditLog>) => {
  return prisma.auditLog.update({ where: { id }, data })
}

export const deleteAuditLog = async (id: number) => {
  return prisma.auditLog.delete({ where: { id } })
}

export const listAuditLogs = async () => {
  return prisma.auditLog.findMany()
}
