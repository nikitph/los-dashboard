"use client";

import React from "react";
import { ArrowLeft, Clipboard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CardRadioGroup from "@/components/CardRadioGroup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoanEligibilityForm } from "../hooks/useLoanEligibilityForm";
import { useTranslations } from "next-intl";

/**
 * Form component for loan eligibility confirmation
 *
 * @param {Object} props - Component props
 * @param {any} props.loanApplication - The loan application data
 * @param {any} props.loanEligibilityData - The loan eligibility data
 * @returns {JSX.Element} LoanEligibilityForm component
 */
export default function LoanEligibilityForm({
  loanApplication,
  loanEligibilityData,
}: {
  loanApplication: any;
  loanEligibilityData: any;
}) {
  const t = useTranslations("LoanEligibility");

  const {
    value,
    setValue,
    selectedValue,
    setSelectedValue,
    options,
    handleProceedClick,
    handleDeclineClick,
    visibility,
  } = useLoanEligibilityForm({
    loanApplication,
    loanEligibilityData,
  });

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{t("title")}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-6 overflow-auto p-4">
        {/* Document Card */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">{t("sections.document.title")}</h2>
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                <Clipboard className="mr-2 h-4 w-4" />
                {t("buttons.copy")}
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                {t("buttons.download")}
              </Button>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4">
            <Card>
              {visibility.eligibleLoanAmount && (
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex grow flex-col gap-1">
                    <span className="text-sm text-muted-foreground">{t("form.eligibleLoanAmount.label")}</span>
                    <span className="text-2xl font-semibold">₹{loanEligibilityData.eligibleLoanAmount}</span>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <FileText className="h-5 w-5" />
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              {visibility.loanApplicationDetails && (
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex grow flex-col gap-1">
                    <span className="text-sm text-muted-foreground">{t("form.applicationLoanAmount.label")}</span>
                    <span className="text-2xl font-semibold">₹{loanApplication.amountRequested}</span>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <Clipboard className="h-5 w-5" />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              {visibility.proposedAmount && (
                <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                  <Label htmlFor="proposedAmount" className="text-sm text-muted-foreground">
                    {t("form.proposedAmount.label")}
                  </Label>
                  <Input
                    id="proposedAmount"
                    placeholder={t("form.proposedAmount.placeholder")}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full border-none bg-gray-100"
                    disabled={!visibility.canUpdateProposedAmount}
                  />
                  {visibility.eligibleLoanAmount && (
                    <p className="text-xs text-muted-foreground">
                      {t("form.maxEligibleAmount", { amount: loanEligibilityData?.eligibleLoanAmount })}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tenure Section */}
        {visibility.selectedTenure && (
          <div className="flex w-full flex-col gap-4 pt-4">
            <h3 className="text-xl font-semibold">{t("sections.tenure.title")}</h3>
            <CardRadioGroup options={options} setSelectedValue={setSelectedValue} selectedValue={selectedValue} />
          </div>
        )}

        {/* Agreement Section */}
        <div className="flex w-full flex-col gap-4 pt-4">
          <span className="font-medium">{t("sections.agreement.title")}</span>
          <div className="flex items-start gap-2">
            <Button size="lg" onClick={handleProceedClick} disabled={!visibility.canProceed}>
              {t("buttons.proceed")}
            </Button>
            <Button variant="outline" size="lg" onClick={handleDeclineClick} disabled={!visibility.canDecline}>
              {t("buttons.decline")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
