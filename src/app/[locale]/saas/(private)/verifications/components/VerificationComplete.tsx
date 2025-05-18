"use client";

import React from "react";
import { Alert } from "@/subframe/components/Alert";
import { Button } from "@/subframe/components/Button";

function VerificationComplete({ loanApplicationId, failed }: { loanApplicationId: string; failed: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-start gap-6 bg-default-background px-6 py-12">
      {!failed ? (
        <div className="flex w-full flex-col items-start gap-6">
          <span className="font-heading-2 text-heading-2 text-default-font">Verification Completion</span>
          <Alert
            variant="success"
            icon="FeatherCheckCircle"
            title="Verification Complete"
            description="The Residence and Business Verification has been completed, send for loan sanction?"
          />
          <div className="flex w-full items-center justify-between">
            <Button variant="brand-tertiary" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>
              Back
            </Button>
            <Button onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>Send for sanction</Button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-start gap-6">
          <span className="font-heading-2 text-heading-2 text-default-font">Verification Completion</span>
          <Alert
            variant="warning"
            icon="FeatherAlertTriangle"
            title="Discrepancies Found"
            description="The Residence and Business Verification is completed, some discrepancies were found. Send this application for Reverification?"
          />
          <div className="flex w-full items-center justify-between">
            <Button variant="brand-tertiary" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>
              Back
            </Button>
            <Button onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>Send for Reverification</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationComplete;
