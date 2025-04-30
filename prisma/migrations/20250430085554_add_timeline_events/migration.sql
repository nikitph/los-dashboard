-- CreateEnum
CREATE TYPE "TimelineEntityType" AS ENUM ('APPLICANT', 'LOAN_APPLICATION', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('APPLICATION_CREATED', 'APPLICATION_UPDATED', 'APPLICATION_DELETED', 'APPLICATION_REOPENED', 'STATUS_CHANGE', 'DOCUMENT_UPLOADED', 'DOCUMENT_REVIEWED', 'DOCUMENT_DELETED', 'DOCUMENT_REQUESTED', 'USER_CREATED', 'USER_ASSIGNED_ROLE', 'USER_REMOVED_ROLE', 'VERIFICATION_STARTED', 'VERIFICATION_COMPLETED', 'VERIFICATION_FAILED', 'VERIFICATION_REMARK_ADDED', 'ACTION_REQUESTED', 'ACTION_APPROVED', 'ACTION_REJECTED', 'ACTION_CANCELLED', 'ACTION_REVIEWED', 'NOTE_ADDED', 'REMARK_ADDED', 'SYSTEM_EVENT', 'AUTO_VERIFICATION', 'SCHEDULED_TASK_COMPLETED', 'ACCESS_GRANTED', 'ACCESS_REVOKED');

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "timelineEntityType" "TimelineEntityType" NOT NULL,
    "timelinEntityId" TEXT NOT NULL,
    "timelineEventType" "TimelineEventType" NOT NULL,
    "actionData" JSONB,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "loanApplicationId" TEXT,
    "applicantId" TEXT,
    "documentId" TEXT,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimelineEvent_timelineEntityType_timelinEntityId_idx" ON "TimelineEvent"("timelineEntityType", "timelinEntityId");

-- CreateIndex
CREATE INDEX "TimelineEvent_timelineEventType_idx" ON "TimelineEvent"("timelineEventType");

-- CreateIndex
CREATE INDEX "TimelineEvent_createdAt_idx" ON "TimelineEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("authId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_loanApplicationId_fkey" FOREIGN KEY ("loanApplicationId") REFERENCES "LoanApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
