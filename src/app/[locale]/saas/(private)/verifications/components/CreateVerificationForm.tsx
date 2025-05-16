"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { useCreateVerificationForm } from "../hooks/useCreateVerificationForm";
import { VerificationType } from "@prisma/client";

interface CreateVerificationFormProps {
  loanApplicationId: string;
  defaultType?: string;
}

/**
 * Form component for creating new verifications
 *
 * @param {CreateVerificationFormProps} props - Component props
 * @returns {JSX.Element} Create verification form component
 */
export function CreateVerificationForm({ loanApplicationId, defaultType = "RESIDENCE" }: CreateVerificationFormProps) {
  const t = useTranslations("Verification");

  // Use the custom hook for form state management
  const { form, visibility, isSubmitting, onSubmit, selectedType } = useCreateVerificationForm({
    loanApplicationId,
    defaultType: defaultType as VerificationType,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("form.create.title")}</CardTitle>
        <CardDescription>{t("form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/*<FormFields control={form.control} visibility={visibility} selectedTab="verification" />*/}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()} disabled={isSubmitting}>
          {t("form.actions.cancel")}
        </Button>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting || !visibility.canCreate}>
          {isSubmitting ? t("form.actions.creating") : t("form.actions.create")}
        </Button>
      </CardFooter>
    </Card>
  );
}
