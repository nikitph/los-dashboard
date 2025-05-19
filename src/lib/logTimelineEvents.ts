import { prisma } from "@/lib/prisma/prisma";
import { RoleType } from "@prisma/client";

type TimelineEntityType = "APPLICANT" | "LOAN_APPLICATION" | "DOCUMENT" | "VERIFICATION";
type TimelineEventType =
  // Application lifecycle
  | "APPLICATION_CREATED"
  | "APPLICATION_UPDATED"
  | "APPLICATION_DELETED"
  | "APPLICATION_REOPENED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_REJECTED"
  | "APPLICATION_REVIEW_REJECTED"
  | "APPLICATION_REVIEW_APPROVED"
  | "STATUS_CHANGE"

  // Documents
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_REVIEWED"
  | "DOCUMENT_DELETED"
  | "DOCUMENT_REQUESTED"

  // User actions
  | "USER_CREATED"
  | "USER_ASSIGNED_ROLE"
  | "USER_REMOVED_ROLE"

  // Verifications
  | "VERIFICATION_STARTED"
  | "VERIFICATION_COMPLETED"
  | "VERIFICATION_FAILED"
  | "VERIFICATION_REVIEW_APPROVED"
  | "VERIFICATION_REVIEW_REJECTED"
  | "VERIFICATION_REMARK_ADDED"

  // Approval flow
  | "ACTION_REQUESTED"
  | "ACTION_APPROVED"
  | "ACTION_REJECTED"
  | "ACTION_CANCELLED"
  | "ACTION_REVIEWED"

  // Notes and remarks
  | "NOTE_ADDED"
  | "REMARK_ADDED"
  | "SANCTION_REMARK_ADDED"

  // System events
  | "SYSTEM_EVENT"
  | "AUTO_VERIFICATION"
  | "SCHEDULED_TASK_COMPLETED"

  // Security actions
  | "ACCESS_GRANTED"
  | "ACCESS_REVOKED";

type LogTimelineEventParams = {
  timelineEntityType: TimelineEntityType;
  timelineEntityId: string;
  timelineEventType: TimelineEventType;
  userId: string;
  userName: string;
  role: RoleType;
  remarks?: string;
  actionData: Record<string, any>;
  loanApplicationId?: string;
  applicantId?: string;
  documentId?: string;
};

export async function logTimelineEvent(params: LogTimelineEventParams) {
  const {
    timelineEntityType,
    timelineEntityId,
    timelineEventType,
    userId,
    userName,
    role,
    remarks,
    actionData,
    loanApplicationId,
    applicantId,
    documentId,
  } = params;

  return prisma.timelineEvent.create({
    data: {
      timelineEntityType,
      timelineEntityId,
      timelineEventType,
      userId,
      userName,
      role,
      remarks,
      actionData,
      loanApplicationId,
      applicantId,
      documentId,
    },
  });
}
