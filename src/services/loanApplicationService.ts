import { prisma } from "@/lib/prisma/prisma";
import { LoanStatus, LoanType, TimelineEventType } from "@prisma/client";
import { logTimelineEvent } from "@/lib/logTimelineEvents";

export async function createLoanApplicationWithLog(input: {
  applicantId: string;
  bankId: string;
  loanType: LoanType;
  amountRequested: string | number;
  status: LoanStatus;
  userId: string;
}) {
  const newLoanApplication = await prisma.loanApplication.create({
    data: {
      applicantId: input.applicantId,
      bankId: input.bankId,
      loanType: input.loanType,
      amountRequested: parseFloat(String(input.amountRequested)),
      status: input.status,
    },
    include: {
      applicant: true,
    },
  });

  await logTimelineEvent({
    timelineEntityType: "LOAN_APPLICATION",
    timelinEntityId: newLoanApplication.id,
    timelineEventType: "APPLICATION_CREATED",
    userId: input.userId,
    remarks: "Loan application created",
    actionData: {},
    loanApplicationId: newLoanApplication.id,
    applicantId: newLoanApplication.applicantId,
  });

  return newLoanApplication;
}

/**
 * Updates the loan application's status and logs the change in the timeline.
 *
 * @param params - Input data
 * @param params.loanApplicationId - ID of the loan application
 * @param params.newStatus - New status to update to
 * @param params.userId - ID of the user performing the update
 * @param params.eventType - Timeline event type (e.g. 'STATUS_UPDATED', 'ESCALATED')
 * @param params.remarks - Optional remarks for the change
 */
export async function updateLoanApplicationStatusWithLog(params: {
  loanApplicationId: string;
  newStatus: LoanStatus;
  userId: string;
  eventType: TimelineEventType;
  remarks?: string;
}) {
  const updatedLoanApplication = await prisma.loanApplication.update({
    where: { id: params.loanApplicationId },
    data: {
      status: params.newStatus,
      updatedAt: new Date(),
    },
  });

  await logTimelineEvent({
    timelineEntityType: "LOAN_APPLICATION",
    timelinEntityId: updatedLoanApplication.id,
    timelineEventType: params.eventType,
    userId: params.userId,
    remarks: params.remarks || `Loan status updated to ${params.newStatus}`,
    actionData: {},
    loanApplicationId: updatedLoanApplication.id,
    applicantId: updatedLoanApplication.applicantId,
  });

  return updatedLoanApplication;
}
