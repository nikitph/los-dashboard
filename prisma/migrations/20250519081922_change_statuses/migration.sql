-- AlterEnum
ALTER TYPE "TimelineEntityType" ADD VALUE 'VERIFICATION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TimelineEventType" ADD VALUE 'APPLICATION_APPROVED';
ALTER TYPE "TimelineEventType" ADD VALUE 'APPLICATION_REJECTED';
ALTER TYPE "TimelineEventType" ADD VALUE 'APPLICATION_REVIEWED';
ALTER TYPE "TimelineEventType" ADD VALUE 'VERIFICATION_REVIEWED';
ALTER TYPE "TimelineEventType" ADD VALUE 'VERIFICATION_REJECTED';

-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "verificationId" TEXT;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
