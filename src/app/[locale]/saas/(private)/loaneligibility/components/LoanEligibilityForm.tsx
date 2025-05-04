"use client";

import React, { useState } from "react";
import { ArrowLeft, Clipboard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CardRadioGroup from "@/components/CardRadioGroup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateLoanApplicationTenure } from "@/app/[locale]/saas/(private)/loaneligibility/actions/updateLoanApplicationTenure";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

function calculateEMI(principal: number, tenureMonths: number, annualRate = 12): number {
  const monthlyRate = annualRate / 12 / 100;
  return Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1),
  );
}

function LoanEligibilityForm({
  loanApplication,
  loanEligibilityData,
}: {
  loanApplication: any;
  loanEligibilityData: any;
}) {
  console.log("loanEligibilityData", loanEligibilityData);
  const [value, setValue] = React.useState(loanEligibilityData.eligibleLoanAmount || "");
  const [selectedValue, setSelectedValue] = useState<string>("tenure2");
  const router = useRouter();
  const locale = useLocale();

  const options = React.useMemo(() => {
    const principal = parseFloat(value);
    if (isNaN(principal) || principal <= 0) return [];

    const tenures = [12, 24, 36, 48, 60];

    return tenures.map((months, i) => {
      const emi = calculateEMI(principal, months);
      return {
        id: `tenure${i + 1}`,
        tenure: months,
        unit: "months",
        emi: emi,
      };
    });
  }, [value]);

  const selectedOption = options.find((option) => option.id === selectedValue)!;
  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex w-full items-center gap-4 px-6 py-6">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="grow text-2xl font-semibold">Loan Eligibility Amount</h1>
      </div>

      {/* Main Content */}
      <div className="flex w-full grow flex-col gap-8 overflow-auto px-12 py-8">
        <div className="flex w-full max-w-4xl flex-col gap-6">
          {/* Loan Amount Cards */}
          <div className="flex w-full flex-col gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex grow flex-col gap-1">
                  <span className="text-sm text-muted-foreground">As Per Income Document</span>
                  <span className="text-2xl font-semibold">₹{loanEligibilityData.eligibleLoanAmount}</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <FileText className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex grow flex-col gap-1">
                  <span className="text-sm text-muted-foreground">As Per Loan Application</span>
                  <span className="text-2xl font-semibold">₹{loanApplication.amountRequested}</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Clipboard className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
                  <Label htmlFor="proposedAmount" className="text-sm text-muted-foreground">
                    Proposed Loan Amount
                  </Label>
                  <Input
                    id="proposedAmount"
                    placeholder="Enter amount"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full border-none bg-gray-100"
                  />
                  <p className="text-xs text-muted-foreground">
                    max loan amount is {loanEligibilityData?.eligibleLoanAmount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tenure Section */}
          <div className="flex w-full flex-col gap-4 pt-4">
            <h3 className="text-xl font-semibold">Tenure chosen by the applicant</h3>
            <CardRadioGroup options={options} setSelectedValue={setSelectedValue} selectedValue={selectedValue} />
          </div>

          {/* Agreement Section */}
          <div className="flex w-full flex-col gap-4 pt-4">
            <span className="font-medium">Applicant agrees to the loan amount</span>
            <div className="flex items-start gap-2">
              <Button
                size="lg"
                onClick={async () => {
                  const response = await updateLoanApplicationTenure(
                    loanApplication.id,
                    selectedOption.tenure,
                    selectedOption.emi,
                    parseFloat(value),
                  );
                  console.log("response", response);
                  router.push(`/${locale}/saas/loanconfirmation?lid=${loanApplication.id}&status=a`);
                }}
              >
                Yes, proceed
              </Button>
              <Button variant="outline" size="lg">
                No, decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanEligibilityForm;
