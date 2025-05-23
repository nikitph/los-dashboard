/*
  Warnings:

  - A unique constraint covering the columns `[bankId,sequenceType]` on the table `ApplicationNumberSequence` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApplicationNumberSequence_bankId_sequenceType_key" ON "ApplicationNumberSequence"("bankId", "sequenceType");
