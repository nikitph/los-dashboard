-- AlterTable
ALTER TABLE "LoanApplication" ADD COLUMN     "calculatedEMI" DOUBLE PRECISION,
ADD COLUMN     "proposedAmount" DOUBLE PRECISION,
ADD COLUMN     "selectedTenure" INTEGER;
