"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CreateGuarantorForm
} from "@/app/[locale]/saas/(private)/guarantor/components/GuarantorForm/CreateGuarantorForm";

/**
 * Page component for creating a new guarantor
 */
export default function GuarantorCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Guarantor");

  // Get loanApplicationId from query params if it exists
  const loanApplicationId = searchParams.get("loanApplicationId") || "";

  // Handle successful creation
  const handleSuccess = () => {
    router.push("/guarantor");
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/guarantor");
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <PageHeader title={t("page.createTitle")} description={t("page.createDescription")} />

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <CreateGuarantorForm loanApplicationId={loanApplicationId} />
      </Suspense>
    </div>
  );
}
