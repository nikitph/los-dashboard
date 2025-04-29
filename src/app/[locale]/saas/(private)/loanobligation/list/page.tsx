"use server";

import { Button } from "@/components/ui/button";
import { defineAbilityFor } from "@/lib/casl/ability";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getLoanObligations } from "../actions/loanObligationActions";
import { defineLoanObligationFieldVisibility } from "../lib/defineLoanObligationFieldVisibility";

export default async function LoanObligationListPage() {
  // Get current user and define their abilities
  const user = await getServerSessionUser();
  const ability = defineAbilityFor(user);
  const fieldVisibility = defineLoanObligationFieldVisibility(ability);
  const t = await getTranslations("LoanObligations");

  // Check if user can read loan obligations
  if (!ability.can("read", "LoanObligation")) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("errors.unauthorized")}</h1>
        <p>{t("errors.forbidden")}</p>
      </div>
    );
  }

  // Fetch all loan obligations
  const response = await getLoanObligations();
  const loanObligations = response.success ? response.data : [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">{t("list.title")}</h1>

          {fieldVisibility.actions.createLoanObligation && (
            <Link href="/saas/applicants">
              <Button variant="default" className="bg-black text-white">
                {t("list.createNew")}
              </Button>
            </Link>
          )}
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">{t("list.applicant")}</th>
                  {fieldVisibility.fields.cibilScore.visible && (
                    <th className="border p-3 text-left">{t("list.cibilScore")}</th>
                  )}
                  {fieldVisibility.fields.totalLoan.visible && (
                    <th className="border p-3 text-left">{t("list.totalLoan")}</th>
                  )}
                  {fieldVisibility.fields.totalEmi.visible && (
                    <th className="border p-3 text-left">{t("list.totalEmi")}</th>
                  )}
                  <th className="border p-3 text-left">{t("list.loanDetailsCount")}</th>
                  <th className="border p-3 text-left">{t("list.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {(loanObligations?.length ?? 0 > 0) ? (
                  loanObligations?.map((obligation: any) => (
                    <tr key={obligation.id} className="hover:bg-gray-50">
                      <td className="border p-3">{obligation.applicant?.name || "Unknown"}</td>
                      {fieldVisibility.fields.cibilScore.visible && (
                        <td className="border p-3">{obligation.cibilScore || "N/A"}</td>
                      )}
                      {fieldVisibility.fields.totalLoan.visible && (
                        <td className="border p-3">
                          {obligation.totalLoan ? `₹${obligation.totalLoan.toLocaleString()}` : "N/A"}
                        </td>
                      )}
                      {fieldVisibility.fields.totalEmi.visible && (
                        <td className="border p-3">
                          {obligation.totalEmi ? `₹${obligation.totalEmi.toLocaleString()}` : "N/A"}
                        </td>
                      )}
                      <td className="border p-3">{obligation.loanDetails?.length || 0}</td>
                      <td className="border p-3">
                        <div className="flex space-x-2">
                          <Link href={`/[locale]/saas/(private)/loanobligation/${obligation.id}/view`}>
                            <Button variant="outline" size="sm">
                              {t("actions.view")}
                            </Button>
                          </Link>

                          {ability.can("update", "LoanObligation") && (
                            <Link href={`/[locale]/saas/(private)/loanobligation/${obligation.id}/edit`}>
                              <Button variant="outline" size="sm">
                                {t("actions.edit")}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="border p-3 text-center">
                      {t("list.noObligationsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
