/*
  Warnings:

  - You are about to drop the column `feedback` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Verification` table. All the data in the column will be lost.
  - Added the required column `result` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verificationTime` to the `Verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Verification" DROP COLUMN "feedback",
DROP COLUMN "notes",
ADD COLUMN     "addressCity" TEXT,
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "addressState" TEXT,
ADD COLUMN     "addressZipCode" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "locationFromMain" TEXT,
ADD COLUMN     "photographUrl" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "result" BOOLEAN NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "verificationTime" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ResidenceVerification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "verificationId" TEXT NOT NULL,
    "ownerFirstName" TEXT,
    "ownerLastName" TEXT,
    "residentSince" TEXT,
    "residenceType" TEXT,
    "structureType" TEXT,

    CONSTRAINT "ResidenceVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessVerification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "verificationId" TEXT NOT NULL,
    "businessName" TEXT,
    "businessType" TEXT,
    "contactDetails" TEXT,
    "businessExistence" BOOLEAN,
    "natureOfBusiness" TEXT,
    "salesPerDay" TEXT,

    CONSTRAINT "BusinessVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyVerification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "verificationId" TEXT NOT NULL,
    "ownerFirstName" TEXT,
    "ownerLastName" TEXT,
    "structureType" TEXT,

    CONSTRAINT "PropertyVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleVerification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "verificationId" TEXT NOT NULL,
    "engineNumber" TEXT,
    "chassisNumber" TEXT,
    "registrationNumber" TEXT,
    "make" TEXT,
    "model" TEXT,
    "vehicleType" TEXT,
    "taxInvoiceUrl" TEXT,
    "deliveryChalanUrl" TEXT,
    "stampedReceiptUrl" TEXT,
    "rcUrl" TEXT,
    "inspectionReportUrl" TEXT,
    "vehiclePhotoUrl" TEXT,

    CONSTRAINT "VehicleVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResidenceVerification_verificationId_key" ON "ResidenceVerification"("verificationId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessVerification_verificationId_key" ON "BusinessVerification"("verificationId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyVerification_verificationId_key" ON "PropertyVerification"("verificationId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleVerification_verificationId_key" ON "VehicleVerification"("verificationId");

-- AddForeignKey
ALTER TABLE "ResidenceVerification" ADD CONSTRAINT "ResidenceVerification_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessVerification" ADD CONSTRAINT "BusinessVerification_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyVerification" ADD CONSTRAINT "PropertyVerification_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleVerification" ADD CONSTRAINT "VehicleVerification_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
