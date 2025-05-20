"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { IconButton } from "@/subframe/components/IconButton";
import { Badge } from "@/subframe/components/Badge";
import { Alert } from "@/subframe/components/Alert";
import { Avatar } from "@/subframe/components/Avatar";
import { LoanStatusBadge } from "@/components/LoanStatusBadge";
import { getTimeAgo } from "@/lib/displayUtils";
import { useViewLoanApplicationForm } from "../hooks/useViewLoanApplicationForm";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Timeline from "@/components/Timeline";
import ReviewForm from "../../review/components/ReviewForm";
import { ReviewEntityType, ReviewEventType } from "@prisma/client";

/**
 * Component for displaying detailed loan application information
 *
 * @param {object} props - Component props
 * @param {LoanApplicationView} props.loanApplication - The loan application data to display
 * @returns {JSX.Element} Loan application view component
 */
export function ReviewLoanApplicationForm({
  loanApplication,
}: {
  loanApplication: LoanApplicationView;
}): React.ReactNode {
  const { visibility, isDeleting, handleDelete } = useViewLoanApplicationForm({ loanApplication });
  const t = useTranslations("LoanApplication");
  const router = useRouter();

  console.log("loanApplication", loanApplication);

  // Handle back navigation
  const handleBack = () => {
    router.push("/saas/loanapplication/list");
  };

  if (!visibility.id) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Alert
          icon="FeatherAlertTriangle"
          title={t("errors.unauthorized")}
          description={t("errors.noViewPermission")}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-4 px-12 py-12">
      {/* Header Section */}
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center gap-4">
          <div className="flex shrink-0 grow basis-0 items-center gap-3">
            <IconButton icon="FeatherArrowLeft" onClick={handleBack} />
            <span className="font-heading-2 text-heading-2 text-default-font">{t("view.title")}</span>
            {visibility.status && <LoanStatusBadge status={loanApplication.status} />}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="flex w-full items-center gap-2">
              {visibility.id && (
                <Badge variant="neutral" icon="FeatherHash">
                  LA-{loanApplication.id.substring(0, 6)}
                </Badge>
              )}
              <div className="flex h-4 w-px flex-none flex-col items-center gap-2 bg-neutral-border" />
              {visibility.createdAt && (
                <Badge variant="neutral" icon="FeatherClock">
                  {t("view.submittedTimeAgo", { timeAgo: getTimeAgo(loanApplication.createdAt) })}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Metadata badges */}
      </div>

      {/* Applicant Information */}
      {visibility.applicant && (
        <Card className="w-full">
          <CardContent className="flex flex-col justify-between gap-4 px-4 py-4">
            <div className="flex w-full items-center gap-4">
              <Avatar size="large" image={loanApplication.applicant.photoUrl ?? ""}>
                {loanApplication.applicant.user.firstName[0]}
                {loanApplication.applicant.user.lastName[0]}
              </Avatar>
              <div className="flex shrink-0 grow basis-0 flex-col items-start">
                <span className="font-heading-3 text-heading-3 text-default-font">
                  {loanApplication.applicant.user.firstName} {loanApplication.applicant.user.lastName}
                </span>
                <span className="font-body text-body text-subtext-color">{loanApplication.applicant.user.email}</span>
              </div>
              <div className="flex w-1/2 justify-end gap-8">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-caption text-caption text-subtext-color">{t("view.amountRequested")}</span>
                  <span className="font-body-bold text-body-bold text-default-font">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(loanApplication.amountRequested)}
                  </span>
                </div>

                {loanApplication.selectedTenure && (
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-caption text-caption text-subtext-color">{t("view.selectedTenure")}</span>
                    <span className="font-body-bold text-body-bold text-default-font">
                      {t("view.tenureValue", { months: loanApplication.selectedTenure })}
                    </span>
                  </div>
                )}

                {loanApplication.calculatedEMI && (
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-caption text-caption text-subtext-color">{t("view.monthlyEMI")}</span>
                    <span className="font-body-bold text-body-bold text-default-font">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(loanApplication.calculatedEMI)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Alert */}
      {loanApplication.status === "PENDING_VERIFICATION" && (
        <Alert
          icon="FeatherClock"
          title={t("alerts.verificationTitle")}
          description={t("alerts.verificationDescription")}
        />
      )}

      <Timeline
        // @ts-ignore
        events={loanApplication.timelineEvents.filter((ev) => {
          return ev.timelineEventType === "CLERK_REMARK_ADDED";
        })}
      />
      <ReviewForm
        reviewEntityType={ReviewEntityType.LOAN_APPLICATION}
        reviewEntityId={loanApplication.id}
        reviewEventType={ReviewEventType.LOAN_OFFICER_REVIEW}
        loanApplicationId={loanApplication.id}
        actionData={{}}
        onSuccess={() => {}}
        onError={() => {}}
      />
    </div>
  );
}
