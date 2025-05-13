/*
  Warnings:

  - You are about to drop the column `deliveryChalanUrl` on the `VehicleVerification` table. All the data in the column will be lost.
  - You are about to drop the column `inspectionReportUrl` on the `VehicleVerification` table. All the data in the column will be lost.
  - You are about to drop the column `rcUrl` on the `VehicleVerification` table. All the data in the column will be lost.
  - You are about to drop the column `stampedReceiptUrl` on the `VehicleVerification` table. All the data in the column will be lost.
  - You are about to drop the column `taxInvoiceUrl` on the `VehicleVerification` table. All the data in the column will be lost.
  - You are about to drop the column `vehiclePhotoUrl` on the `VehicleVerification` table. All the data in the column will be lost.
  - You are about to drop the column `addressCity` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine1` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `addressState` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `addressZipCode` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `locationFromMain` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `photographUrl` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `Verification` table. All the data in the column will be lost.
  - Added the required column `addressCity` to the `BusinessVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressLine1` to the `BusinessVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressState` to the `BusinessVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressZipCode` to the `BusinessVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationFromMain` to the `BusinessVerification` table without a default value. This is not possible if the table is not empty.
  - Made the column `businessName` on table `BusinessVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessType` on table `BusinessVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contactDetails` on table `BusinessVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `businessExistence` on table `BusinessVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `natureOfBusiness` on table `BusinessVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `salesPerDay` on table `BusinessVerification` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `addressCity` to the `PropertyVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressLine1` to the `PropertyVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressState` to the `PropertyVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressZipCode` to the `PropertyVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationFromMain` to the `PropertyVerification` table without a default value. This is not possible if the table is not empty.
  - Made the column `ownerFirstName` on table `PropertyVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerLastName` on table `PropertyVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `structureType` on table `PropertyVerification` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `addressCity` to the `ResidenceVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressLine1` to the `ResidenceVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressState` to the `ResidenceVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressZipCode` to the `ResidenceVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationFromMain` to the `ResidenceVerification` table without a default value. This is not possible if the table is not empty.
  - Made the column `ownerFirstName` on table `ResidenceVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerLastName` on table `ResidenceVerification` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `residenceType` to the `ResidenceVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `structureType` to the `ResidenceVerification` table without a default value. This is not possible if the table is not empty.
  - Made the column `make` on table `VehicleVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `model` on table `VehicleVerification` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ResidenceType" AS ENUM ('OWNED', 'RENTED');

-- CreateEnum
CREATE TYPE "StructureType" AS ENUM ('DUPLEX', 'APARTMENT', 'BUNGALOW');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'VEHICLE_PHOTO';
ALTER TYPE "DocumentType" ADD VALUE 'PROPERTY_PHOTO';
ALTER TYPE "DocumentType" ADD VALUE 'BUSINESS_PHOTO';
ALTER TYPE "DocumentType" ADD VALUE 'VEHICLE_REGISTRATION_CERTIFICATE';
ALTER TYPE "DocumentType" ADD VALUE 'VEHICLE_INSPECTION_REPORT';
ALTER TYPE "DocumentType" ADD VALUE 'VEHICLE_STAMPED_RECEIPT';
ALTER TYPE "DocumentType" ADD VALUE 'VEHICLE_TAX_INVOICE';
ALTER TYPE "DocumentType" ADD VALUE 'VEHICLE_DELIVERY_CHALAN';

-- AlterTable
ALTER TABLE "BusinessVerification" ADD COLUMN     "addressCity" TEXT NOT NULL,
ADD COLUMN     "addressLine1" TEXT NOT NULL,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "addressState" TEXT NOT NULL,
ADD COLUMN     "addressZipCode" TEXT NOT NULL,
ADD COLUMN     "locationFromMain" TEXT NOT NULL,
ALTER COLUMN "businessName" SET NOT NULL,
ALTER COLUMN "businessType" SET NOT NULL,
ALTER COLUMN "contactDetails" SET NOT NULL,
ALTER COLUMN "businessExistence" SET NOT NULL,
ALTER COLUMN "natureOfBusiness" SET NOT NULL,
ALTER COLUMN "salesPerDay" SET NOT NULL;

-- AlterTable
ALTER TABLE "PropertyVerification" ADD COLUMN     "addressCity" TEXT NOT NULL,
ADD COLUMN     "addressLine1" TEXT NOT NULL,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "addressState" TEXT NOT NULL,
ADD COLUMN     "addressZipCode" TEXT NOT NULL,
ADD COLUMN     "locationFromMain" TEXT NOT NULL,
ALTER COLUMN "ownerFirstName" SET NOT NULL,
ALTER COLUMN "ownerLastName" SET NOT NULL,
ALTER COLUMN "structureType" SET NOT NULL;

-- AlterTable
ALTER TABLE "ResidenceVerification" ADD COLUMN     "addressCity" TEXT NOT NULL,
ADD COLUMN     "addressLine1" TEXT NOT NULL,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "addressState" TEXT NOT NULL,
ADD COLUMN     "addressZipCode" TEXT NOT NULL,
ADD COLUMN     "locationFromMain" TEXT NOT NULL,
ALTER COLUMN "ownerFirstName" SET NOT NULL,
ALTER COLUMN "ownerLastName" SET NOT NULL,
DROP COLUMN "residenceType",
ADD COLUMN     "residenceType" "ResidenceType" NOT NULL,
DROP COLUMN "structureType",
ADD COLUMN     "structureType" "StructureType" NOT NULL;

-- AlterTable
ALTER TABLE "VehicleVerification" DROP COLUMN "deliveryChalanUrl",
DROP COLUMN "inspectionReportUrl",
DROP COLUMN "rcUrl",
DROP COLUMN "stampedReceiptUrl",
DROP COLUMN "taxInvoiceUrl",
DROP COLUMN "vehiclePhotoUrl",
ALTER COLUMN "make" SET NOT NULL,
ALTER COLUMN "model" SET NOT NULL;

-- AlterTable
ALTER TABLE "Verification" DROP COLUMN "addressCity",
DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "addressState",
DROP COLUMN "addressZipCode",
DROP COLUMN "locationFromMain",
DROP COLUMN "photographUrl",
DROP COLUMN "verifiedAt";
