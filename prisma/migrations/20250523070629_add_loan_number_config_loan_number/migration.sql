-- AlterTable
ALTER TABLE "ApplicationNumberConfiguration" ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "branchNumber" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "loanTypeCode" TEXT,
ADD COLUMN     "serialNumberPadding" INTEGER NOT NULL DEFAULT 5;

-- CreateIndex
CREATE INDEX "ApplicationNumberConfiguration_bankId_idx" ON "ApplicationNumberConfiguration"("bankId");

-- CreateIndex
CREATE INDEX "ApplicationNumberConfiguration_createdAt_idx" ON "ApplicationNumberConfiguration"("createdAt");
