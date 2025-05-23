/*
  Warnings:

  - A unique constraint covering the columns `[bankId]` on the table `ApplicationNumberSequence` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ApplicationNumberSequence" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationNumberSequence_bankId_key" ON "ApplicationNumberSequence"("bankId");
