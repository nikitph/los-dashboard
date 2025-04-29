"use server";

import { defineAbilityFor } from "@/lib/casl/ability";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma/prisma";
import { redirect } from "next/navigation";
import LoanObligationForm from "../components/LoanObligationForm";

interface CreateLoanObligationPageProps {
  searchParams: {
    aid?: string;
  };
}

export default async function CreateLoanObligationPage({ searchParams }: CreateLoanObligationPageProps) {
  const { aid: applicantId } = searchParams;
  const t = await getTranslations("LoanObligations");

  // Get current user and define their abilities
  const user = await getServerSessionUser();
  const ability = defineAbilityFor(user);

  // Check if user can create loan obligations
  if (!ability.can("create", "LoanObligation")) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("errors.unauthorized")}</h1>
        <p>{t("errors.forbidden")}</p>
      </div>
    );
  }

  // Validate that applicantId is provided
  if (!applicantId) {
    redirect("/saas/applicants");
  }

  // Verify that the applicant exists
  const applicant = await prisma.applicant.findUnique({
    where: {
      id: applicantId,
    },
  });

  if (!applicant) {
    redirect("/saas/applicants");
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{t("pageTitle.create")}</h1>
        </div>

        <div className="">
          <LoanObligationForm applicantId={applicantId} />
        </div>
      </div>
    </div>
  );
}
