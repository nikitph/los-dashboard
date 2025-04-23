"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useViewLoanApplicationForm } from "../hooks/useViewLoanApplicationForm";
import { formatCurrency, formatDate, formatLoanStatus, formatLoanType } from "../lib/helpers";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";

interface ViewLoanApplicationFormProps {
  loanApplication: LoanApplicationView;
}

export function ViewLoanApplicationForm({ loanApplication }: ViewLoanApplicationFormProps) {
  const { visibility, isDeleting, handleDelete } = useViewLoanApplicationForm({ loanApplication });
  const t = useTranslations("LoanApplication");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("view.title")}</CardTitle>
        <CardDescription>{t("view.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibility.id && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("view.id")}</h4>
              <p className="break-all text-sm font-medium">{loanApplication.id}</p>
            </div>
          )}

          {visibility.applicant && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("view.applicant")}</h4>
              <p className="text-sm font-medium">{loanApplication.applicantName || t("view.notAvailable")}</p>
            </div>
          )}

          {visibility.loanType && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("view.loanType")}</h4>
              <p className="text-sm font-medium">{formatLoanType(loanApplication.loanType)}</p>
            </div>
          )}

          {visibility.amountRequested && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("view.amountRequested")}</h4>
              <p className="text-sm font-medium">
                {loanApplication.formattedAmount || formatCurrency(loanApplication.amountRequested)}
              </p>
            </div>
          )}

          {visibility.status && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("view.status")}</h4>
              <div className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${loanApplication.statusBadgeColor}`}>
                {formatLoanStatus(loanApplication.status)}
              </div>
            </div>
          )}

          {visibility.createdAt && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("view.createdAt")}</h4>
              <p className="text-sm font-medium">
                {loanApplication.formattedCreatedAt || formatDate(loanApplication.createdAt)}
              </p>
            </div>
          )}

          {visibility.updatedAt && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("view.updatedAt")}</h4>
              <p className="text-sm font-medium">
                {loanApplication.formattedUpdatedAt || formatDate(loanApplication.updatedAt)}
              </p>
            </div>
          )}
        </div>

        {/* Relation sections */}
        {visibility.guarantors && (
          <div className="mt-4 border-t pt-4">
            <h3 className="mb-2 text-lg font-medium">{t("view.guarantors")}</h3>
            {/* Guarantors list would go here */}
            <p className="text-sm text-gray-500">{t("view.guarantorsDescription")}</p>
          </div>
        )}

        {visibility.documents && (
          <div className="mt-4 border-t pt-4">
            <h3 className="mb-2 text-lg font-medium">{t("view.documents")}</h3>
            {/* Documents list would go here */}
            <p className="text-sm text-gray-500">{t("view.documentsDescription")}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          {t("view.back")}
        </Button>
        <div className="flex gap-2">
          {visibility.canUpdate && (
            <Button
              type="button"
              variant="outline"
              onClick={() => (window.location.href = `/saas/loanapplication/${loanApplication.id}/edit`)}
            >
              {t("view.edit")}
            </Button>
          )}
          {visibility.canDelete && (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("view.deleting") : t("view.delete")}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
