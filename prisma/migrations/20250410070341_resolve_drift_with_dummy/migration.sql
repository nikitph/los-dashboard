/*
  Warnings:

  - The primary key for the `UserProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `auth_id` on the `UserProfile` table. All the data in the column will be lost.

*/

-- If errors occur, rollback:
-- ROLLBACK;
-- DropForeignKey
ALTER TABLE "Applicant" DROP CONSTRAINT "Applicant_userId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "UserRoles" DROP CONSTRAINT "UserRoles_userId_fkey";

-- DropForeignKey
ALTER TABLE "Verification" DROP CONSTRAINT "Verification_verifiedById_fkey";

-- Drop the PendingAction foreign keys (that were missed before)
ALTER TABLE public."PendingAction" DROP CONSTRAINT IF EXISTS "PendingAction_requestedById_fkey";
ALTER TABLE public."PendingAction" DROP CONSTRAINT IF EXISTS "PendingAction_reviewedById_fkey";

-- DropIndex
DROP INDEX "UserProfile_authId_key";

-- AlterTable
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_pkey",
DROP COLUMN "auth_id",
ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("authId");

-- AddForeignKey
ALTER TABLE "UserRoles" ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("authId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("authId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("authId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "UserProfile"("authId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("authId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."PendingAction" ADD CONSTRAINT "PendingAction_requestedById_fkey"
    FOREIGN KEY ("requestedById") REFERENCES public."UserProfile"("authId")
        ON DELETE RESTRICT ON UPDATE CASCADE; -- Example

ALTER TABLE public."PendingAction" ADD CONSTRAINT "PendingAction_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES public."UserProfile"("authId")
        ON DELETE SET NULL ON UPDATE CASCADE;
