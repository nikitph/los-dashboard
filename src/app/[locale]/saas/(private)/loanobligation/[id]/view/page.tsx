"use server";

import { defineAbilityFor } from "@/lib/casl/ability";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLoanObligationById } from "../../actions/loanObligationActions";
import LoanObligationForm from "../../components/LoanObligationForm";

interface ViewLoanObligationPageProps {
  params: {
    id: string;
  };
}

export default async function ViewLoanObligationPage({ params }: ViewLoanObligationPageProps) {
  const { id } = params;
  const t = await getTranslations("LoanObligations");

  // Get current user and define their abilities
  const user = await getServerSessionUser();
  const ability = defineAbilityFor(user);

  // Check if user can read loan obligations
  if (!ability.can("read", "LoanObligation")) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("errors.unauthorized")}</h1>
        <p>{t("errors.forbidden")}</p>
      </div>
    );
  }

  // Fetch loan obligation data
  const response = await getLoanObligationById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const loanObligation = response.data;

  // Transform data to match the form structure
  const formData = {
    cibilScore: loanObligation.cibilScore?.toString() || "",
    loans: loanObligation.loanDetails.map((detail: any) => ({
      outstandingLoan: detail.outstandingLoan.toString(),
      emiAmount: detail.emiAmount.toString(),
      loanDate: detail.loanDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      loanType: detail.loanType,
      bankName: detail.bankName,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{t("pageTitle.view")}</h1>
        </div>

        <div className="rounded-lg bg-white shadow">
          <LoanObligationForm applicantId={loanObligation.applicantId} initialData={formData} isReadOnly={true} />
        </div>
      </div>
    </div>
  );
}
