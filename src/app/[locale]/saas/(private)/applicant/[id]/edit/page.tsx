import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { ChevronLeftIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getApplicant } from "../../actions/getApplicant";
import { UpdateApplicantForm } from "../../components/UpdateApplicantForm";

type EditApplicantPageProps = {
  params: {
    id: string;
  };
};

/**
 * Loading skeleton for the applicant edit page
 */
function EditApplicantSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-6 w-1/4" />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <Skeleton className="m-6 h-[400px]" />
      </Card>
    </div>
  );
}

/**
 * Page component for editing an applicant
 */
export default async function EditApplicantPage({ params }: EditApplicantPageProps) {
  const t = await getTranslations("Applicant");

  // Get the current user and check permissions
  const user = await getServerSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get the user's ability
  const ability = await getAbility(user);

  // Check if user can update applicants
  if (!ability.can("update", "Applicant")) {
    redirect(`/applicant/${params.id}/view`);
  }

  // Get the applicant data
  const response = await getApplicant(params.id);

  if (!response.success) {
    return (
      <div className="container space-y-6 py-6">
        <PageHeader
          title={t("edit.notFound.title")}
          description={t("edit.notFound.description")}
          actions={
            <Button asChild variant="outline">
              <Link href="/applicant/list">
                <ChevronLeftIcon className="mr-2 h-4 w-4" />
                {t("edit.actions.backToList")}
              </Link>
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>{t("edit.notFound.cardTitle")}</CardTitle>
            <CardDescription>{t("edit.notFound.cardDescription")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check if the applicant is deleted
  if (response.data?.deletedAt) {
    redirect(`/applicant/${params.id}/view`);
  }

  return (
    <div className="container space-y-6 py-6">
      <PageHeader
        title={t("edit.pageTitle", { name: response.data?.fullName || params.id })}
        description={t("edit.pageDescription")}
        actions={
          <Button asChild variant="outline">
            <Link href={`/applicant/${params.id}/view`}>
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              {t("edit.actions.backToView")}
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<EditApplicantSkeleton />}>
        <UpdateApplicantForm initialData={response.data!} />
      </Suspense>
    </div>
  );
}
