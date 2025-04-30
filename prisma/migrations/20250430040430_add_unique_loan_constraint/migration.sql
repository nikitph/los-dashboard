/*
  Warnings:

  - A unique constraint covering the columns `[applicantId]` on the table `LoanObligation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LoanObligation_applicantId_key" ON "LoanObligation"("applicantId");
