"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // or shadcn's useToast()
import { Alert } from "@/subframe/components/Alert";
import { Button } from "@/subframe/components/Button";
import { completeVerification } from "@/app/[locale]/saas/(private)/verifications/actions/completeVerification";
import { useLocale } from "next-intl";

function VerificationComplete({ loanApplicationId, failed }: { loanApplicationId: string; failed: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();

  const handleSendForSanction = () => {
    startTransition(async () => {
      try {
        const result = await completeVerification(loanApplicationId);

        if (result.success) {
          toast.success("Verification marked complete. Application sent for sanction.");
          router.push(`/${locale}/saas/dashboard`);
        } else {
          toast.error(result.message || "An error occurred while completing verification.");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Something went wrong. Please try again later.");
      }
    });
  };

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
            <Button variant="brand-tertiary">Back</Button>
            <Button onClick={handleSendForSanction} disabled={isPending}>
              {isPending ? "Processing..." : "Send for sanction"}
            </Button>
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
            <Button variant="brand-tertiary">Back</Button>
            <Button onClick={() => {}}>Send for Reverification</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationComplete;
