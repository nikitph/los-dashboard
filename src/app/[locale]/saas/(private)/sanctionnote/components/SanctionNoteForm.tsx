"use client";

import React, { useState } from "react";
import { IconWithBackground } from "@/subframe/components/IconWithBackground";
import { ToggleGroup } from "@/subframe/components/ToggleGroup";
import { ReviewEntityType, ReviewEventType } from "@prisma/client";
import ReviewForm from "@/app/[locale]/saas/(private)/review/components/ReviewForm";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { toastSuccess } from "@/lib/toastUtils";

function SanctionNoteForm({ loanApplication }: { loanApplication: any }) {
  const router = useRouter();
  const locale = useLocale();
  const [toggles, setToggles] = useState({
    address: "",
    identity: "",
    income: "",
    loanPolicy: "",
    residence: "",
    business: "",
  });

  const handleToggleChange = (key: keyof typeof toggles) => (value: string) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex w-full flex-col items-start gap-6 px-6 py-6">
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <IconWithBackground size="medium" icon="FeatherClipboardCheck" />
            <div className="flex flex-col items-start gap-1">
              <span className="font-caption text-caption text-subtext-color">Application ID: SN-2024-03-001</span>
              <span className="font-heading-3 text-heading-3 text-default-font">Loan Sanction Note</span>
            </div>
          </div>
          <div className="flex items-start rounded-md bg-brand-100 px-3 py-1">
            <span className="font-caption-bold text-caption-bold text-brand-600">In Progress</span>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
          <span className="font-body text-body text-subtext-color">
            All documents must be verified according to bank loan policy guidelines
          </span>

          <div className="flex w-full flex-col items-start gap-4 border-t border-solid border-neutral-border pt-4">
            {[
              { label: "1. Address - Aadhar", key: "address", icon: "FeatherHome" },
              { label: "2. Identity - PAN", key: "identity", icon: "FeatherUser" },
              { label: "3. Income Documents", key: "income", icon: "FeatherDollarSign" },
              { label: "4. Loan Policy", key: "loanPolicy", icon: "FeatherFileText" },
              { label: "5. Residence Verification", key: "residence", icon: "FeatherMapPin" },
              { label: "6. Business Verification", key: "business", icon: "FeatherBriefcase" },
            ].map(({ label, key, icon }) => (
              <div key={key} className="flex w-full items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <IconWithBackground variant="neutral" icon={icon as any} />
                  <span className="font-body-bold text-body-bold text-default-font">{label}</span>
                </div>
                <ToggleGroup
                  value={toggles[key as keyof typeof toggles]}
                  onValueChange={handleToggleChange(key as keyof typeof toggles)}
                >
                  <ToggleGroup.Item icon={null} value="yes">
                    Yes
                  </ToggleGroup.Item>
                  <ToggleGroup.Item icon={null} value="no">
                    No
                  </ToggleGroup.Item>
                </ToggleGroup>
              </div>
            ))}
          </div>
        </div>

        <ReviewForm
          reviewEntityType={ReviewEntityType.LOAN_APPLICATION}
          reviewEntityId={loanApplication.id}
          reviewEventType={ReviewEventType.LOAN_OFFICER_REVIEW}
          loanApplicationId={loanApplication.id}
          actionData={{ ...toggles }}
          onSuccess={() => {
            toastSuccess({
              title: "Successfully submitted",
              description: "You have successfully submitted the loan sanction note",
            });
            router.push(`/${locale}/saas/dashboard`);
          }}
          onError={() => {}}
        />
      </div>
    </div>
  );
}

export default SanctionNoteForm;
