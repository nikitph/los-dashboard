"use server";

import LoanObligationsForm from "@/app/[locale]/saas/(private)/loanobligations/components/LoanObligationsForm";

export default async function LoanObligationsPage({ searchParams }: { searchParams: { aid: string; lid: string } }) {
  const { lid, aid } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Loan Obligations</h1>
        </div>

        <div className="rounded-lg bg-white shadow">
          <LoanObligationsForm applicantId={aid} loanapplicationId={lid} />
        </div>
      </div>
    </div>
  );
}
