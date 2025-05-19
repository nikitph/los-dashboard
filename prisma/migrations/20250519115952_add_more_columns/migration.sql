/*
  Warnings:

  - Added the required column `role` to the `TimelineEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userName` to the `TimelineEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "role" "RoleType" NOT NULL,
ADD COLUMN     "userName" TEXT NOT NULL;
