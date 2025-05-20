/*
  Warnings:

  - The values [VERIFICATION_OFFICER_REVIEW] on the enum `ReviewEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReviewEventType_new" AS ENUM ('CLERK_REVIEW', 'INSPECTOR_REVIEW', 'LOAN_OFFICER_REVIEW', 'CEO_REVIEW', 'LOAN_COMMITTEE_REVIEW', 'BOARD_REVIEW', 'BANK_ADMIN_REVIEW');
ALTER TABLE "Review" ALTER COLUMN "reviewEventType" TYPE "ReviewEventType_new" USING ("reviewEventType"::text::"ReviewEventType_new");
ALTER TYPE "ReviewEventType" RENAME TO "ReviewEventType_old";
ALTER TYPE "ReviewEventType_new" RENAME TO "ReviewEventType";
DROP TYPE "ReviewEventType_old";
COMMIT;
