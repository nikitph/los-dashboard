import { PageHeader } from "@/components/ui/page-header";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { CreateApplicantForm } from "../components/CreateApplicantForm";

/**
 * Page component for creating a new applicant
 */
export default async function CreateApplicantPage() {
  const t = await getTranslations("Applicant");

  // Get the current user and check permissions
  const user = await getServerSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get the user's ability and check if they can create applicants
  const ability = await getAbility(user);
  if (!ability.can("create", "Applicant")) {
    redirect("/dashboard");
  }

  // Get the bank ID from the user's current role
  const bankId = user.currentRole?.bankId;

  return (
    <div className="container space-y-6 py-6">
      <PageHeader title={t("create.pageTitle")} description={t("create.pageDescription")} />

      <CreateApplicantForm defaultBankId={bankId || undefined} />
    </div>
  );
}
