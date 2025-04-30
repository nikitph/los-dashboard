/*
  Warnings:

  - A unique constraint covering the columns `[applicantId]` on the table `Income` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Income_applicantId_key" ON "Income"("applicantId");
