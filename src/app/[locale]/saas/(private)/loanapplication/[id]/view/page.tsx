"use server";

import { ViewLoanApplicationForm } from "@/app/[locale]/saas/(private)/loanapplication/components/ViewLoanApplicationForm";
import { notFound } from "next/navigation";
import { getLoanApplication } from "@/app/[locale]/saas/(private)/loanapplication/actions/getLoanApplication";

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

    return <ViewLoanApplicationForm loanApplication={response.data} />;
  } catch (error) {
    console.error("Error fetching loan application:", error);
    return notFound();
  }
}
