-- AlterTable
ALTER TABLE "Income" ADD COLUMN     "averageGrossCashIncome" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "averageMonthlyExpenditure" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "dependents" INTEGER NOT NULL DEFAULT 0;
