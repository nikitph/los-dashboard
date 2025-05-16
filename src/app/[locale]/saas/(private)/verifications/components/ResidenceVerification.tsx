"use client";

import React from "react";
import { IconButton } from "@/subframe/components/IconButton";
import { Button } from "@/subframe/components/Button";
import { useTranslations } from "next-intl";
import { useCreateVerificationForm } from "@/app/[locale]/saas/(private)/verifications/hooks/useCreateVerificationForm";
import { VerificationType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import { useUser } from "@/contexts/userContext";
import ResidenceVerificationFormFields from "./ResidenceVerificationFormFields";

interface CreateVerificationFormProps {
  loanApplicationId: string;
  defaultType?: string;
}

/**
 * A form component for creating residence verifications with field-level permission control
 *
 * @param {CreateVerificationFormProps} props - Component props
 * @returns {JSX.Element} The residence verification form
 */
function ResidenceVerification({ loanApplicationId, defaultType = "RESIDENCE" }: CreateVerificationFormProps) {
  const t = useTranslations("Verification");
  const router = useRouter();
  const { user } = useUser();

  // Use the custom hook for form state management
  const { form, visibility, isSubmitting, onSubmit, selectedType, formattedDate } = useCreateVerificationForm({
    loanApplicationId,
    defaultType: defaultType as VerificationType,
  });

  // Handle back button
  const handleBack = () => {
    router.back();
  };

  // Only render the form if the user has permission to create verifications
  if (!visibility.canCreate) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 p-8">
        <div className="text-xl font-semibold text-red-600">{t("permissions.noCreateAccess")}</div>
        <Button onClick={handleBack}>{t("form.actions.back")}</Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-6 bg-default-background px-6 py-6">
      <div className="flex w-full items-center gap-2">
        <IconButton size="small" icon="FeatherArrowLeft" onClick={handleBack} />
        <span className="font-heading-2 text-heading-2 text-default-font">{t("form.sections.residence")}</span>
      </div>

      {/* Wrap the form with Form component from shadcn/ui */}
      <Form {...form} namespace={"Verification"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col items-start gap-6">
          {/* Extract form fields to a separate component */}
          <ResidenceVerificationFormFields
            form={form}
            visibility={visibility}
            formattedDate={formattedDate}
            user={user}
            t={t}
            loanApplicationId={loanApplicationId}
          />

          {/* Action Buttons */}
          <div className="flex w-full items-center gap-2">
            <Button type="button" variant="neutral-secondary" onClick={handleBack} disabled={isSubmitting}>
              {t("form.actions.back")}
            </Button>
            {visibility.canUpdate && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("form.actions.creating") : "Proceed to Business Verification"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ResidenceVerification;
