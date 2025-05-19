/*
  Warnings:

  - You are about to drop the column `timelinEntityId` on the `TimelineEvent` table. All the data in the column will be lost.
  - Added the required column `timelineEntityId` to the `TimelineEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TimelineEvent_timelineEntityType_timelinEntityId_idx";

-- AlterTable
ALTER TABLE "TimelineEvent" DROP COLUMN "timelinEntityId",
ADD COLUMN     "timelineEntityId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "TimelineEvent_timelineEntityType_timelineEntityId_idx" ON "TimelineEvent"("timelineEntityType", "timelineEntityId");
