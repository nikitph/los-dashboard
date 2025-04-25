"use server";

import { prisma } from "@/lib/prisma";
import LoanEligibilityForm from "@/app/[locale]/saas/(private)/loaneligibility/components/LoanEligibilityForm";

export default async function LoanEligibilityPage({ searchParams }: { searchParams: { lid: string; aid: string } }) {
  const applicantId = searchParams?.aid;
  const loanApplicationId = searchParams?.lid;

  const loanApplication = await prisma.loanApplication.findUnique({
    where: {
      id: loanApplicationId,
    },
    include: {
      applicant: true,
    },
  });

  return (
    <div>
      <LoanEligibilityForm loanApplication={loanApplication} />
    </div>
  );
}
