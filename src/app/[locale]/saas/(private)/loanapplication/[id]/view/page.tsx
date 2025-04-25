import { getLoanApplication } from "@/app/[locale]/saas/(private)/loanapplication/actions/getLoanApplication";
import { ViewLoanApplicationForm } from "@/app/[locale]/saas/(private)/loanapplication/components/ViewLoanApplicationForm";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

interface ViewLoanApplicationPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export async function generateMetadata({ params: { locale, id } }: ViewLoanApplicationPageProps) {
  const t = await getTranslations({ locale, namespace: "LoanApplication" });
  return {
    title: t("meta.view.title"),
    description: t("meta.view.description"),
  };
}

export default async function ViewLoanApplicationPage({ params: { id } }: ViewLoanApplicationPageProps) {
  // Get loan application data
  const response = await getLoanApplication(id);

  if (!response.success || !response.data) {
    return notFound();
  }

  // Get the loan application data from the response
  const loanApplication = response.data;

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">View Loan Application</h1>
        <p className="text-muted-foreground">View details for this loan application.</p>
      </div>
      <ViewLoanApplicationForm loanApplication={loanApplication} />
    </div>
  );
}
