"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CreateCoApplicantForm } from "../components/CreateCoApplicantForm";

/**
 * Page component for creating a new CoApplicant
 *
 * @returns {JSX.Element} Create CoApplicant page
 */
export default function CreateCoApplicantPage() {
  const t = useTranslations("CoApplicant");
  const searchParams = useSearchParams();
  const loanApplicationId = searchParams.get("loanApplicationId");

  if (!loanApplicationId) {
    return (
      <div className="container py-6">
        <PageHeader title={t("page.create.title")} description={t("page.create.description")} />
        <div className="py-4">
          <div className="rounded-md bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">
            {t("page.create.noLoanApplicationId")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <PageHeader title={t("page.create.title")} description={t("page.create.description")} />
      <div className="py-4">
        <CreateCoApplicantForm loanApplicationId={loanApplicationId} />
      </div>
    </div>
  );
}
