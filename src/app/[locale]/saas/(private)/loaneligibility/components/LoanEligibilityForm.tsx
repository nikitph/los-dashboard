"use client";

import React from "react";
import { ArrowLeft, CheckCircle, Clipboard, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CardRadioGroup from "@/components/CardRadioGroup";

function LoanEligibilityForm({ loanApplication }: { loanApplication: any }) {
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
                  <span className="text-2xl font-semibold">₹20,00,000</span>
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
                  <span className="text-2xl font-semibold">₹30,00,000</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Clipboard className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex grow flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Proposed Loan Amount</span>
                  <span className="text-2xl font-semibold">₹30,00,000</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Alert */}
          <Alert className="border-none bg-secondary">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                <Mail className="h-4 w-4" />
              </div>
              <AlertDescription className="text-sm">Message forwarded to Applicant</AlertDescription>
            </div>
          </Alert>

          {/* Tenure Section */}
          <div className="flex w-full flex-col gap-4 pt-4">
            <h3 className="text-xl font-semibold">Tenure chosen by the applicant</h3>
            <CardRadioGroup />
          </div>

          {/* Agreement Section */}
          <div className="flex w-full flex-col gap-4 pt-4">
            <span className="font-medium">Applicant agrees to the loan amount</span>
            <div className="flex items-start gap-2">
              <Button size="lg">Yes, proceed</Button>
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
