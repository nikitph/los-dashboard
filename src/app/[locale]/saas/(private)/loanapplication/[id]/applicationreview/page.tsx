"use server";

import { notFound } from "next/navigation";
import { getLoanApplication } from "@/app/[locale]/saas/(private)/loanapplication/actions/getLoanApplication";
import { ReviewLoanApplicationForm } from "@/app/[locale]/saas/(private)/loanapplication/components/ReviewLoanApplicationForm";

interface ViewLoanApplicationPageProps {
  params: {
    id: string;
  };
}

export default async function ViewLoanApplicationPage({ params }: ViewLoanApplicationPageProps) {
  try {
    const { id } = await params;
    const response = await getLoanApplication(id);

    if (!response.success) {
      return notFound();
    }

    return <ReviewLoanApplicationForm loanApplication={response.data} />;
  } catch (error) {
    console.error("Error fetching loan application:", error);
    return notFound();
  }
}
