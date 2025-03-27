/*
  Warnings:

  - Added the required column `billingCycle` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planType` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL,
ADD COLUMN     "paymentMethod" JSONB,
ADD COLUMN     "planType" "PlanType" NOT NULL;
