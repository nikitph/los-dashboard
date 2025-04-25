import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon } from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Suspense } from "react";
import { getApplicants } from "../actions/getApplicants";
import { ApplicantTable } from "../components/ApplicantTable";

/**
 * Loading skeleton for the applicant list page
 */
function ApplicantTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}

/**
 * Applicant list page component
 */
export default async function ApplicantListPage() {
  const t = await getTranslations("Applicant");

  // Initial load of applicants for SSR
  const response = await getApplicants({ limit: 10, page: 1 });

  return (
    <div className="container space-y-6 py-6">
      <PageHeader
        title={t("list.pageTitle")}
        description={t("list.pageDescription")}
        actions={
          <Button asChild>
            <Link href="/applicant/create">
              <PlusIcon className="mr-2 h-4 w-4" />
              {t("list.actions.createNew")}
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<ApplicantTableSkeleton />}>
        <ApplicantTable initialData={response.success ? response.data : []} />
      </Suspense>
    </div>
  );
}
