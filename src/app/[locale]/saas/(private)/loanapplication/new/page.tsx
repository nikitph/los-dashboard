"use server";

import { getTranslations } from "next-intl/server";
import { NewLoanApplicationForm } from "@/app/[locale]/saas/(private)/loanapplication/components/NewLoanApplicationForm";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "LoanApplication" });
  return {
    title: t("meta.create.title"),
    description: t("meta.create.description"),
  };
}

export default async function NewLoanApplicationPage() {
  return (
    <div className="mx-auto flex max-w-[600px] flex-col gap-12">
      <NewLoanApplicationForm />
    </div>
  );
}
