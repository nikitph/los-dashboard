import { prisma } from "@/lib/prisma/prisma";
import type { LoanStatus, LoanType } from "@prisma/client";
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
