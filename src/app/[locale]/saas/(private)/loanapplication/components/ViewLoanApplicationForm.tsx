"use client";

import React, { useState } from "react";
import { IconButton } from "@/subframe/components/IconButton";
import { Badge } from "@/subframe/components/Badge";
import { Button } from "@/subframe/components/Button";
import { IconWithBackground } from "@/subframe/components/IconWithBackground";
import { Alert } from "@/subframe/components/Alert";
import { Avatar } from "@/subframe/components/Avatar";
import { useTranslations } from "next-intl";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";
import { Tabs } from "@/components/subframe/ui";
import { LoanStatusBadge } from "@/components/LoanStatusBadge";
import { calculateAge, getTimeAgo } from "@/lib/displayUtils";
import { formatCurrency } from "@/app/[locale]/saas/(private)/loanapplication/lib/helpers";
import Timeline from "@/components/Timeline";
import { DocumentsTab } from "@/app/[locale]/saas/(private)/loanapplication/components/DocumentsTab";

interface ViewLoanApplicationFormProps {
  loanApplication: LoanApplicationView;
}

export function ViewLoanApplicationForm({ loanApplication }: ViewLoanApplicationFormProps) {
  //const { visibility, isDeleting, handleDelete } = useViewLoanApplicationForm({ loanApplication });
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const t = useTranslations("LoanApplication");

  console.log("loanApplication:", loanApplication);

  return (
    <div className="flex w-full flex-col items-start gap-4 px-12 py-12">
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center gap-4">
          <div className="flex shrink-0 grow basis-0 items-center gap-3">
            <IconButton icon="FeatherArrowLeft" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
            <span className="font-heading-2 text-heading-2 text-default-font">Loan Application Details</span>
            <LoanStatusBadge status={loanApplication.status} />
          </div>
          <div className="flex items-center gap-2">
            <Button icon="FeatherEdit2" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>
              Edit Application
            </Button>
          </div>
        </div>
        <div className="flex w-full items-center gap-2">
          <Badge variant="neutral" icon="FeatherHash">
            LA-28389
          </Badge>
          <div className="flex h-4 w-px flex-none flex-col items-center gap-2 bg-neutral-border" />
          <Badge variant="neutral" icon="FeatherClock">
            Submitted {getTimeAgo(loanApplication.createdAt)}
          </Badge>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
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
        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-200" />
        <div className="flex w-full flex-wrap items-start gap-8">
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
            <span className="font-caption text-caption text-subtext-color">Phone</span>
            <span className="font-body-bold text-body-bold text-default-font">
              +91 {loanApplication.applicant.user.phoneNumber}
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
            <span className="font-caption text-caption text-subtext-color">Age</span>
            <span className="font-body-bold text-body-bold text-default-font">
              {loanApplication.applicant.dateOfBirth
                ? `${calculateAge(loanApplication.applicant.dateOfBirth)} years`
                : "N/A"}
            </span>
          </div>
          <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
            <span className="font-caption text-caption text-subtext-color">Employment</span>
            <span className="font-body-bold text-body-bold text-default-font">Salaried</span>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-start gap-4">
        <div className="flex shrink-0 grow basis-0 items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
          <IconWithBackground icon="FeatherDollarSign" />
          <div className="flex shrink-0 grow basis-0 flex-col items-start">
            <span className="font-body text-body text-subtext-color">Amount Requested</span>
            <span className="font-heading-2 text-heading-2 text-default-font">
              {formatCurrency(loanApplication.amountRequested)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 grow basis-0 items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
          <IconWithBackground variant="success" icon="FeatherCalendar" />
          <div className="flex shrink-0 grow basis-0 flex-col items-start">
            <span className="font-body text-body text-subtext-color">Selected Tenure</span>
            <span className="font-heading-2 text-heading-2 text-default-font">
              {loanApplication.selectedTenure} months
            </span>
          </div>
        </div>
        <div className="flex shrink-0 grow basis-0 items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
          <IconWithBackground variant="warning" icon="FeatherCreditCard" />
          <div className="flex shrink-0 grow basis-0 flex-col items-start">
            <span className="font-body text-body text-subtext-color">Monthly EMI</span>
            <span className="font-heading-2 text-heading-2 text-default-font">
              {formatCurrency(loanApplication?.calculatedEMI)}
            </span>
          </div>
        </div>
      </div>
      <Alert
        icon="FeatherClock"
        title="Verification in Progress"
        description="Our team is currently reviewing the application documents. Expected completion in 24-48 hours."
        actions={
          <IconButton size="medium" icon="FeatherX" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}} />
        }
      />
      <div className="flex w-full flex-col items-start gap-6">
        <Tabs className={"flex-auto"}>
          <Tabs.Item active={activeTabIndex === 0} onClick={() => setActiveTabIndex(0)}>
            Documents
          </Tabs.Item>
          <Tabs.Item active={activeTabIndex === 1} onClick={() => setActiveTabIndex(1)}>
            Co-Applicants
          </Tabs.Item>
          <Tabs.Item active={activeTabIndex === 2} onClick={() => setActiveTabIndex(2)}>
            Verifications
          </Tabs.Item>
          <Tabs.Item active={activeTabIndex === 3} onClick={() => setActiveTabIndex(3)}>
            Timeline
          </Tabs.Item>
        </Tabs>
        {activeTabIndex === 0 && <DocumentsTab loanApplicationId={loanApplication.id} />}
        {activeTabIndex === 1 && (
          <>
            <Timeline events={loanApplication.timelineEvents} />

            {loanApplication.timelineEvents.map((event) => (
              <div key={event.id} className="flex w-full shrink-0 grow basis-0 items-start gap-4">
                <div className="flex flex-col items-center self-stretch">
                  <div className="flex flex-col items-start gap-1">
                    <IconWithBackground size="medium" icon="FeatherFileText" />
                  </div>
                  <div className="flex w-0.5 shrink-0 grow basis-0 flex-col items-start gap-2 bg-neutral-border" />
                </div>
                <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2 pb-6 pt-1.5">
                  <div className="flex w-full flex-wrap items-center gap-2">
                    <div className="flex shrink-0 grow basis-0 flex-wrap items-start gap-1">
                      <span className="font-body-bold text-body-bold text-default-font">
                        {event.user.firstName} {event.user.lastName}
                      </span>
                      <span className="font-body text-body text-subtext-color">
                        {event.timelineEventType.replaceAll("_", " ").toLowerCase()}
                      </span>
                    </div>
                    <span className="font-caption text-caption text-subtext-color">{getTimeAgo(event.createdAt)}</span>
                  </div>
                  {event.remarks && <Alert title="" description={event.remarks} />}
                </div>
              </div>
            ))}
          </>
        )}
        {activeTabIndex === 3 && (
          <div className="flex w-full flex-col items-start">
            <div className="flex w-full shrink-0 grow basis-0 items-start gap-4">
              <div className="flex flex-col items-center self-stretch">
                <div className="flex flex-col items-start gap-1">
                  <IconWithBackground size="medium" icon="FeatherFileText" />
                </div>
                <div className="flex w-0.5 shrink-0 grow basis-0 flex-col items-start gap-2 bg-neutral-border" />
              </div>
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2 pb-6 pt-1.5">
                <div className="flex w-full flex-wrap items-center gap-2">
                  <div className="flex shrink-0 grow basis-0 flex-wrap items-start gap-1">
                    <span className="font-body-bold text-body-bold text-default-font">Sarah Johnson</span>
                    <span className="font-body text-body text-subtext-color">requested additional documentation</span>
                  </div>
                  <span className="font-caption text-caption text-subtext-color">2 hours ago</span>
                </div>
                <Alert
                  title=""
                  description="Please provide last 3 months of business bank statements"
                  actions={
                    <IconButton
                      size="medium"
                      icon="FeatherX"
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                    />
                  }
                />
              </div>
            </div>
            <div className="flex w-full shrink-0 grow basis-0 items-start gap-4">
              <div className="flex flex-col items-center self-stretch">
                <div className="flex flex-col items-start gap-1">
                  <IconWithBackground variant="success" size="medium" icon="FeatherUpload" />
                </div>
                <div className="flex w-0.5 shrink-0 grow basis-0 flex-col items-start gap-2 bg-neutral-border" />
              </div>
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2 pb-6 pt-1.5">
                <div className="flex w-full flex-wrap items-center gap-2">
                  <div className="flex shrink-0 grow basis-0 flex-wrap items-start gap-1">
                    <span className="font-body-bold text-body-bold text-default-font">Tom Bradley</span>
                    <span className="font-body text-body text-subtext-color">uploaded business plan</span>
                  </div>
                  <span className="font-caption text-caption text-subtext-color">1 day ago</span>
                </div>
              </div>
            </div>
            <div className="flex w-full shrink-0 grow basis-0 items-start gap-4">
              <div className="flex flex-col items-center self-stretch">
                <div className="flex flex-col items-start gap-1">
                  <IconWithBackground size="medium" icon="FeatherUserCheck" />
                </div>
                <div className="flex w-0.5 shrink-0 grow basis-0 flex-col items-start gap-2 bg-neutral-border" />
              </div>
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2 pb-6 pt-1.5">
                <div className="flex w-full flex-wrap items-center gap-2">
                  <div className="flex shrink-0 grow basis-0 flex-wrap items-start gap-1">
                    <span className="font-body-bold text-body-bold text-default-font">Michael Chen</span>
                    <span className="font-body text-body text-subtext-color">assigned as loan officer</span>
                  </div>
                  <span className="font-caption text-caption text-subtext-color">2 days ago</span>
                </div>
              </div>
            </div>
            <div className="flex w-full shrink-0 grow basis-0 items-start gap-4">
              <div className="flex flex-col items-center self-stretch">
                <div className="flex flex-col items-start gap-1">
                  <IconWithBackground variant="neutral" size="medium" icon="FeatherPlusCircle" />
                </div>
              </div>
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2 py-1">
                <div className="flex w-full flex-wrap items-center gap-2">
                  <div className="flex shrink-0 grow basis-0 flex-wrap items-start gap-1">
                    <span className="font-body-bold text-body-bold text-default-font">Tom Bradley</span>
                    <span className="font-body text-body text-subtext-color">created application</span>
                  </div>
                  <span className="font-caption text-caption text-subtext-color">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
