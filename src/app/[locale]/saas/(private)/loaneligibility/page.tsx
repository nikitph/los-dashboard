"use server";

import { prisma } from "@/lib/prisma/prisma";
import LoanEligibilityForm from "@/app/[locale]/saas/(private)/loaneligibility/components/LoanEligibilityForm";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { redirect } from "next/navigation";

async function calculateLoanEligibility(applicantId: string) {
  // Constant for 'times of net income'. This will be derived from the bank Configuration
  const TIMES_OF_NET_INCOME = 2;

  // Get income details for the applicant
  const incomeData = await prisma.income.findFirst({
    where: {
      applicantId: applicantId,
      deletedAt: null,
    },
  });

  // Get loan obligations to calculate total EMI
  const loanObligation = await prisma.loanObligation.findFirst({
    where: {
      applicantId: applicantId,
      deletedAt: null,
    },
  });

  // Calculate gross income - use average gross cash income from the income table
  const grossIncome = incomeData?.averageGrossCashIncome || 0;

  // Get total existing EMI
  const totalEmi = loanObligation?.totalEmi || 0;

  // Calculate net income (Gross Income - Total EMI)
  const netIncome = grossIncome - totalEmi;

  // Calculate eligible loan amount (Net Income × Times of Net Income)
  const eligibleLoanAmount = netIncome * TIMES_OF_NET_INCOME;

  return {
    grossIncome,
    totalEmi,
    netIncome,
    eligibleLoanAmount,
    timesOfNetIncome: TIMES_OF_NET_INCOME,
  };
}

export default async function LoanEligibilityPage({ searchParams }: { searchParams: { lid: string; aid: string } }) {
  const applicantId = searchParams?.aid;
  const loanApplicationId = searchParams?.lid;

  const user = await getServerSessionUser();
  if (!user) {
    redirect("/login");
  }

  const ability = await getAbility(user);
  if (!ability.can("read", "LoanApplication")) {
    redirect("/unauthorized");
  }

  const loanApplication = await prisma.loanApplication.findUnique({
    where: {
      id: loanApplicationId,
    },
    include: {
      applicant: true,
    },
  });

  console.log("loanApplication", loanApplication);

  // @ts-ignore Calculate loan eligibility
  const loanEligibilityData = await calculateLoanEligibility(loanApplication?.applicant?.id);

  console.log("loanEligibilityData", loanEligibilityData);

  return (
    <div>
      <LoanEligibilityForm loanApplication={loanApplication} loanEligibilityData={loanEligibilityData} />
    </div>
  );
}
