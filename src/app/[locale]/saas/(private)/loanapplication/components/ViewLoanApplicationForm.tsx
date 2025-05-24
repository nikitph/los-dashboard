// LoanApplicationView.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { IconButton } from "@/subframe/components/IconButton";
import { Badge } from "@/subframe/components/Badge";
import { Button } from "@/subframe/components/Button";
import { IconWithBackground } from "@/subframe/components/IconWithBackground";
import { Alert } from "@/subframe/components/Alert";
import { Avatar } from "@/subframe/components/Avatar";
import { Tabs } from "@/components/subframe/ui";
import { LoanStatusBadge } from "@/components/LoanStatusBadge";
import { getTimeAgo } from "@/lib/displayUtils";
import { DocumentsTab } from "@/app/[locale]/saas/(private)/loanapplication/components/DocumentsTab";
import Timeline from "@/components/Timeline";
import { useViewLoanApplicationForm } from "../hooks/useViewLoanApplicationForm";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import VerificationsTab from "@/app/[locale]/saas/(private)/loanapplication/components/VerificationsTab";

/**
 * Component for displaying detailed loan application information
 *
 * @param {object} props - Component props
 * @param {LoanApplicationView} props.loanApplication - The loan application data to display
 * @returns {JSX.Element} Loan application view component
 */
export function ViewLoanApplicationForm({
  loanApplication,
}: {
  loanApplication: LoanApplicationView;
}): React.ReactNode {
  const { visibility, isDeleting, handleDelete } = useViewLoanApplicationForm({ loanApplication });
  const t = useTranslations("LoanApplication");
  const router = useRouter();
  const [activeTabIndex, setActiveTabIndex] = React.useState(0);

  // Handle back navigation
  const handleBack = () => {
    router.push("/saas/loanapplication/list");
  };

  // Handle edit navigation
  const handleEdit = () => {
    router.push(`/saas/loanapplication/${loanApplication.id}/edit`);
  };

  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
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
            {visibility.canUpdate && (
              <Button icon="FeatherEdit2" onClick={handleEdit}>
                {t("actions.edit")}
              </Button>
            )}
            {visibility.canDelete && (
              <Button variant="destructive" icon="FeatherTrash2" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? t("actions.deleting") : t("actions.delete")}
              </Button>
            )}
          </div>
        </div>

        {/* Metadata badges */}
        <div className="flex w-full items-center gap-2">
          {visibility.id && (
            <Badge variant="neutral" icon="FeatherHash">
              {loanApplication.loanApplicationNumber}
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

      {/* Applicant Information */}
      {visibility.applicant && (
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 px-4 py-4">
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
            </div>

            <Separator />

            <div className="flex w-full flex-wrap items-start gap-8">
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                <span className="font-caption text-caption text-subtext-color">{t("view.phone")}</span>
                <span className="font-body-bold text-body-bold text-default-font">
                  +91 {loanApplication.applicant.user.phoneNumber}
                </span>
              </div>

              {loanApplication.applicant.dateOfBirth && (
                <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                  <span className="font-caption text-caption text-subtext-color">{t("view.age")}</span>
                  <span className="font-body-bold text-body-bold text-default-font">
                    {t("view.ageValue", {
                      age: new Date().getFullYear() - loanApplication.applicant.dateOfBirth.getFullYear(),
                    })}
                  </span>
                </div>
              )}

              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                <span className="font-caption text-caption text-subtext-color">{t("view.address")}</span>
                <span className="font-body-bold text-body-bold text-default-font">
                  {loanApplication.applicant.addressCity || ""} {loanApplication.applicant.addressState || ""}
                  {loanApplication.applicant.addressPinCode ? `, ${loanApplication.applicant.addressPinCode}` : ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Details Cards */}
      <div className="flex w-full flex-wrap items-start gap-4">
        {visibility.amountRequested && (
          <div className="flex shrink-0 grow basis-0 items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
            <IconWithBackground icon="FeatherDollarSign" />
            <div className="flex shrink-0 grow basis-0 flex-col items-start">
              <span className="font-body text-body text-subtext-color">{t("view.amountRequested")}</span>
              <span className="font-heading-2 text-heading-2 text-default-font">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(loanApplication.amountRequested)}
              </span>
            </div>
          </div>
        )}

        {loanApplication.selectedTenure && (
          <div className="flex shrink-0 grow basis-0 items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
            <IconWithBackground variant="success" icon="FeatherCalendar" />
            <div className="flex shrink-0 grow basis-0 flex-col items-start">
              <span className="font-body text-body text-subtext-color">{t("view.selectedTenure")}</span>
              <span className="font-heading-2 text-heading-2 text-default-font">
                {t("view.tenureValue", { months: loanApplication.selectedTenure })}
              </span>
            </div>
          </div>
        )}

        {loanApplication.calculatedEMI && (
          <div className="flex shrink-0 grow basis-0 items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
            <IconWithBackground variant="warning" icon="FeatherCreditCard" />
            <div className="flex shrink-0 grow basis-0 flex-col items-start">
              <span className="font-body text-body text-subtext-color">{t("view.monthlyEMI")}</span>
              <span className="font-heading-2 text-heading-2 text-default-font">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(loanApplication.calculatedEMI)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status Alert */}
      {loanApplication.status === "PENDING_VERIFICATION" && (
        <Alert
          icon="FeatherClock"
          title={t("alerts.verificationTitle")}
          description={t("alerts.verificationDescription")}
        />
      )}

      {/* Tabs Section */}
      <div className="flex w-full flex-col items-start gap-6">
        <Tabs className={"flex-auto"}>
          <Tabs.Item active={activeTabIndex === 0} onClick={() => handleTabChange(0)}>
            {t("tabs.documents")}
          </Tabs.Item>

          {visibility.coApplicants && (
            <Tabs.Item active={activeTabIndex === 1} onClick={() => handleTabChange(1)}>
              {t("tabs.coApplicants")}
            </Tabs.Item>
          )}

          {visibility.verifications && (
            <Tabs.Item active={activeTabIndex === 2} onClick={() => handleTabChange(2)}>
              {t("tabs.verifications")}
            </Tabs.Item>
          )}

          {visibility.timelineEvents && (
            <Tabs.Item active={activeTabIndex === 3} onClick={() => handleTabChange(3)}>
              {t("tabs.timeline")}
            </Tabs.Item>
          )}
        </Tabs>

        {/* Tab Contents */}
        {activeTabIndex === 0 && visibility.documents && <DocumentsTab loanApplicationId={loanApplication.id} />}

        {activeTabIndex === 1 && visibility.coApplicants && (
          <div className="w-full">
            {loanApplication.coApplicants.length > 0 ? (
              loanApplication.coApplicants.map((coApplicant) => (
                <Card key={coApplicant.id} className="mb-4 w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading-3 text-heading-3">
                          {coApplicant.firstName} {coApplicant.lastName}
                        </h3>
                        <p className="text-subtext-color">{coApplicant.email}</p>
                        <p className="text-subtext-color">{coApplicant.mobileNumber}</p>
                      </div>
                      {visibility.canUpdate && (
                        <Button variant="outline" size="sm" icon="FeatherEdit2">
                          {t("actions.edit")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert
                icon="FeatherInfo"
                title={t("alerts.noCoApplicantsTitle")}
                description={t("alerts.noCoApplicantsDescription")}
              />
            )}

            {visibility.canAddCoApplicant && (
              <Button className="mt-4" icon="FeatherUserPlus">
                {t("actions.addCoApplicant")}
              </Button>
            )}
          </div>
        )}

        {activeTabIndex === 2 && visibility.verifications && (
          <VerificationsTab loanApplication={loanApplication} canAddVerification={visibility.canAddVerification} />
        )}

        {activeTabIndex === 3 && visibility.timelineEvents && <Timeline events={loanApplication.timelineEvents} />}
      </div>
    </div>
  );
}
