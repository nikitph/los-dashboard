"use server";

import { notFound } from "next/navigation";
import { getLoanApplication } from "@/app/[locale]/saas/(private)/loanapplication/actions/getLoanApplication";
import { ReviewLoanApplicationForm } from "@/app/[locale]/saas/(private)/loanapplication/components/ReviewLoanApplicationForm";
import { getServerSessionUser } from "@/lib/getServerUser";
import { CeoReviewLoanApplicationForm } from "@/app/[locale]/saas/(private)/loanapplication/components/CeoReviewLoanApplicationForm";

interface ViewLoanApplicationPageProps {
  params: {
    id: string;
  };
}

export default async function ViewLoanApplicationPage({ params }: ViewLoanApplicationPageProps) {
  try {
    const { id } = await params;
    const user = await getServerSessionUser();
    const response = await getLoanApplication(id);

    if (!response.success) {
      return notFound();
    }

    if (user?.currentRole.role === "CEO") return <CeoReviewLoanApplicationForm loanApplication={response.data} />;
    else return <ReviewLoanApplicationForm loanApplication={response.data} />;
  } catch (error) {
    console.error("Error fetching loan application:", error);
    return notFound();
  }
}
