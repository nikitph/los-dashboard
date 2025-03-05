-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "userProfileId" TEXT;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("auth_id") ON DELETE SET NULL ON UPDATE CASCADE;
