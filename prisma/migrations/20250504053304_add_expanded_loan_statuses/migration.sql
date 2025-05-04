-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LoanStatus" ADD VALUE 'DRAFT';
ALTER TYPE "LoanStatus" ADD VALUE 'PENDING_INSPECTOR_ASSIGNMENT';
ALTER TYPE "LoanStatus" ADD VALUE 'PENDING_VERIFICATION';
ALTER TYPE "LoanStatus" ADD VALUE 'VERIFICATION_IN_PROGRESS';
ALTER TYPE "LoanStatus" ADD VALUE 'VERIFICATION_COMPLETED';
ALTER TYPE "LoanStatus" ADD VALUE 'VERIFICATION_FAILED';
ALTER TYPE "LoanStatus" ADD VALUE 'REJECTED_BY_APPLICANT';
