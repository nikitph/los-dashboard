/*
  Warnings:

  - A unique constraint covering the columns `[officialEmail]` on the table `Bank` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `officialEmail` to the `Bank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "legalEntityName" TEXT,
ADD COLUMN     "officialEmail" TEXT NOT NULL,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "regulatoryLicenses" JSONB,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Bank_officialEmail_key" ON "Bank"("officialEmail");
