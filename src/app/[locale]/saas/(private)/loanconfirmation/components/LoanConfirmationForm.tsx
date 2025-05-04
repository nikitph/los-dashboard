"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Mail } from "lucide-react";
import { LoanApplication, LoanType } from "@prisma/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLoanConfirmationForm } from "../hooks/useLoanConfirmationForm";
import { useTranslations } from "next-intl";

interface LoanConfirmationFormProps {
  loanApplication: LoanApplication;
  status: "a" | "r" | "e";
}

/**
 * Form component for loan confirmation process
 *
 * @param {LoanConfirmationFormProps} props - Component props
 * @returns {JSX.Element} LoanConfirmationForm component
 */
export default function LoanConfirmationForm({ loanApplication, status }: LoanConfirmationFormProps) {
  // Get translations
  const t = useTranslations("LoanConfirmation");

  // Use the loan confirmation hook
  const { remark, setRemark, getMessage, getButtonLabel, handleBackClick, handleProceedClick, visibility } =
    useLoanConfirmationForm({ loanApplication, status });

  // Define loan type label mapping
  const loanTypeLabels: Record<LoanType, string> = {
    PERSONAL: t("loanTypes.personal"),
    VEHICLE: t("loanTypes.vehicle"),
    HOUSE_CONSTRUCTION: t("loanTypes.houseConstruction"),
    PLOT_AND_HOUSE_CONSTRUCTION: t("loanTypes.plotAndHouseConstruction"),
    PLOT_PURCHASE: t("loanTypes.plotPurchase"),
    MORTGAGE: t("loanTypes.mortgage"),
  };

  // Format the loan type for display
  function formatLoanType(loanType: LoanType): string {
    return loanTypeLabels[loanType] ?? t("loanTypes.unknown");
  }

  return (
    <div className="mx-left container px-8 py-12">
      <div className="flex max-w-2xl flex-col items-start gap-8">
        {/* Header */}
        <div className="flex w-full items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
        </div>

        {/* Message Alert */}
        <Alert className="border-none bg-secondary">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
              <Mail className="h-4 w-4" />
            </div>
            <AlertDescription className="text-sm">{t("messageForwarded")}</AlertDescription>
          </div>
        </Alert>

        {/* Main Content */}
        <div className="w-full">
          <div className="pt-2">
            <div className="flex w-full flex-col items-start gap-6">
              {/* Dynamic Message */}
              {visibility.loanType && (
                <p className="text-sm text-muted-foreground">
                  {t(getMessage(), {
                    loanType: formatLoanType(loanApplication.loanType),
                    amount: loanApplication.proposedAmount || loanApplication.amountRequested,
                    /* @ts-ignore */
                    emi: loanApplication.calculatedEMI,
                    /* @ts-ignore */
                    tenure: loanApplication.selectedTenure,
                  })}
                </p>
              )}

              {/* Remark Field */}
              {visibility.remark && (
                <div className="flex w-full flex-col items-start gap-2">
                  <Label htmlFor="remark" className="font-medium">
                    {t("form.remark.label")}
                  </Label>
                  <textarea
                    id="remark"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={t("form.remark.placeholder")}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={4}
                    disabled={!visibility.canUpdateRemark}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex w-full items-center gap-6 pt-4">
                <Button variant="outline" className="w-48" onClick={handleBackClick}>
                  {t("buttons.back")}
                </Button>
                <Button className="flex-grow" onClick={handleProceedClick} disabled={!visibility.canUpdateStatus}>
                  {t(getButtonLabel())}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
