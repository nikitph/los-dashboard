/*
  Warnings:

  - You are about to drop the column `verificationStatus` on the `Document` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedById` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `documentType` on the `Document` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('AADHAAR_CARD', 'PAN_CARD', 'IDENTITY_PROOF', 'ADDRESS_PROOF', 'INCOME_PROOF', 'BANK_STATEMENT', 'PROPERTY_DOCUMENT', 'VEHICLE_DOCUMENT', 'LOAN_AGREEMENT', 'VERIFICATION_PHOTO', 'KYC_DOCUMENT', 'APPLICATION_FORM', 'OTHER');

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_loanApplicationId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "verificationStatus",
ADD COLUMN     "applicantId" TEXT,
ADD COLUMN     "bankConfigurationId" TEXT,
ADD COLUMN     "bankId" TEXT,
ADD COLUMN     "coApplicantId" TEXT,
ADD COLUMN     "dependentId" TEXT,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "guarantorId" TEXT,
ADD COLUMN     "incomeDetailId" TEXT,
ADD COLUMN     "incomeId" TEXT,
ADD COLUMN     "loanObligationDetailId" TEXT,
ADD COLUMN     "loanObligationId" TEXT,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "uploadedById" TEXT NOT NULL,
ADD COLUMN     "verificationId" TEXT,
ALTER COLUMN "loanApplicationId" DROP NOT NULL,
DROP COLUMN "documentType",
ADD COLUMN     "documentType" "DocumentType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "LoanApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_coApplicantId_fkey" FOREIGN KEY ("coApplicantId") REFERENCES "CoApplicant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_guarantorId_fkey" FOREIGN KEY ("guarantorId") REFERENCES "Guarantor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_incomeId_fkey" FOREIGN KEY ("incomeId") REFERENCES "Income"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_incomeDetailId_fkey" FOREIGN KEY ("incomeDetailId") REFERENCES "IncomeDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "Dependent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_loanObligationId_fkey" FOREIGN KEY ("loanObligationId") REFERENCES "LoanObligation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_loanObligationDetailId_fkey" FOREIGN KEY ("loanObligationDetailId") REFERENCES "LoanObligationDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_bankConfigurationId_fkey" FOREIGN KEY ("bankConfigurationId") REFERENCES "BankConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
