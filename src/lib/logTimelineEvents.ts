import { prisma } from "@/lib/prisma/prisma";

type TimelineEntityType = "APPLICANT" | "LOAN_APPLICATION" | "DOCUMENT";
type TimelineEventType =
  | "APPLICATION_CREATED"
  | "APPLICATION_UPDATED"
  | "APPLICATION_DELETED"
  | "APPLICATION_REOPENED"
  | "STATUS_CHANGE"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_REVIEWED"
  | "DOCUMENT_DELETED"
  | "DOCUMENT_REQUESTED"
  | "USER_CREATED"
  | "USER_ASSIGNED_ROLE"
  | "USER_REMOVED_ROLE"
  | "VERIFICATION_STARTED"
  | "VERIFICATION_COMPLETED"
  | "VERIFICATION_FAILED"
  | "VERIFICATION_REMARK_ADDED"
  | "ACTION_REQUESTED"
  | "ACTION_APPROVED"
  | "ACTION_REJECTED"
  | "ACTION_CANCELLED"
  | "ACTION_REVIEWED"
  | "NOTE_ADDED"
  | "REMARK_ADDED"
  | "SYSTEM_EVENT"
  | "AUTO_VERIFICATION"
  | "SCHEDULED_TASK_COMPLETED"
  | "ACCESS_GRANTED"
  | "ACCESS_REVOKED";

type LogTimelineEventParams = {
  timelineEntityType: TimelineEntityType;
  timelinEntityId: string;
  timelineEventType: TimelineEventType;
  userId: string;
  remarks?: string;
  actionData: Record<string, any>;
  loanApplicationId?: string;
  applicantId?: string;
  documentId?: string;
};

export async function logTimelineEvent(params: LogTimelineEventParams) {
  const {
    timelineEntityType,
    timelinEntityId,
    timelineEventType,
    userId,
    remarks,
    actionData,
    loanApplicationId,
    applicantId,
    documentId,
  } = params;

  return prisma.timelineEvent.create({
    data: {
      timelineEntityType,
      timelinEntityId,
      timelineEventType,
      userId,
      remarks,
      actionData,
      loanApplicationId,
      applicantId,
      documentId,
    },
  });
}
