import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getApplicant } from "../../../actions/getApplicant";
import { ViewApplicantForm } from "../../../components/ViewApplicantForm";

type ViewApplicantPageProps = {
  params: {
    id: string;
  };
};

/**
 * Loading skeleton for the applicant view page
 */
function ViewApplicantSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-6 w-1/4" />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-1/6" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Page component for viewing a single applicant's details
 */
export default async function ViewApplicantPage({ params }: ViewApplicantPageProps) {
  const t = await getTranslations("Applicant");

  // Get the current user and check permissions
  const user = await getServerSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get the user's ability and check if they can read applicants
  const ability = await getAbility(user);
  if (!ability.can("read", "Applicant")) {
    redirect("/dashboard");
  }

  // Get the applicant data
  const response = await getApplicant(params.id);

  if (!response.success) {
    return (
      <div className="container space-y-6 py-6">
        <PageHeader
          title={t("view.notFound.title")}
          description={t("view.notFound.description")}
          actions={
            <Button asChild variant="outline">
              <Link href="/applicant/list">
                <ChevronLeftIcon className="mr-2 h-4 w-4" />
                {t("view.actions.backToList")}
              </Link>
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>{t("view.notFound.cardTitle")}</CardTitle>
            <CardDescription>{t("view.notFound.cardDescription")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-6">
      <PageHeader
        title={response.data?.fullName || t("view.applicant")}
        description={t("view.pageDescription")}
        actions={
          <Button asChild variant="outline">
            <Link href="/applicant/list">
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              {t("view.actions.backToList")}
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<ViewApplicantSkeleton />}>
        <ViewApplicantForm applicant={response.data!} />
      </Suspense>
    </div>
  );
}
