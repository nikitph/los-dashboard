"use server";

import { prisma } from "@/lib/prisma";
import LoanObligationsForm from "@/app/[locale]/saas/(private)/loanobligations/components/LoanObligationsForm";

export default async function LoanObligationsPage({ searchParams }: any) {
  const { lid } = await searchParams;

  console.log("lid", lid);
  const loanApplication = await prisma.loanApplication.findUnique({
    where: {
      id: lid,
    },
    include: {
      applicant: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Loan Obligations</h1>
        </div>

        <div className="rounded-lg bg-white shadow">
          <LoanObligationsForm applicantId={loanApplication?.applicant?.id} />
        </div>
      </div>
    </div>
  );
}
