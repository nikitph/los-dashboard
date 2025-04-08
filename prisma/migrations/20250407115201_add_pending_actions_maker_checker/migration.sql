-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PendingActionType" AS ENUM ('REQUEST_BANK_USER_CREATION');

-- CreateTable
CREATE TABLE "PendingAction" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "bankId" TEXT,
    "actionType" "PendingActionType" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewRemarks" TEXT,
    "targetModel" TEXT,
    "targetRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingAction_status_bankId_idx" ON "PendingAction"("status", "bankId");

-- CreateIndex
CREATE INDEX "PendingAction_requestedById_idx" ON "PendingAction"("requestedById");

-- CreateIndex
CREATE INDEX "PendingAction_reviewedById_idx" ON "PendingAction"("reviewedById");

-- AddForeignKey
ALTER TABLE "PendingAction" ADD CONSTRAINT "PendingAction_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingAction" ADD CONSTRAINT "PendingAction_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "UserProfile"("authId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingAction" ADD CONSTRAINT "PendingAction_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "UserProfile"("authId") ON DELETE SET NULL ON UPDATE CASCADE;
