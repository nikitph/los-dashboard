import { getLoanApplication } from "@/app/[locale]/saas/(private)/loanapplication/actions/getLoanApplication";
import { UpdateLoanApplicationForm } from "@/app/[locale]/saas/(private)/loanapplication/components/UpdateLoanApplicationForm";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

interface EditLoanApplicationPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export async function generateMetadata({ params: { locale, id } }: EditLoanApplicationPageProps) {
  const t = await getTranslations({ locale, namespace: "LoanApplication" });
  return {
    title: t("meta.edit.title"),
    description: t("meta.edit.description"),
  };
}

export default async function EditLoanApplicationPage({ params: { id, locale } }: EditLoanApplicationPageProps) {
  // Get loan application data
  const response = await getLoanApplication(id);

  if (!response.success || !response.data) {
    return notFound();
  }

  // Get translations
  const t = await getTranslations({ locale, namespace: "LoanApplication" });

  // Get the loan application data from the response
  const loanApplication = response.data;

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("form.update.title")}</h1>
        <p className="text-muted-foreground">{t("form.update.description")}</p>
      </div>
      <UpdateLoanApplicationForm initialData={loanApplication} />
    </div>
  );
}
