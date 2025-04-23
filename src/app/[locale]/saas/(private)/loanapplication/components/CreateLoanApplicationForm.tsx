"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { useCreateLoanApplicationForm } from "../hooks/useCreateLoanApplicationForm";
import { FormFields } from "./FormFields";

interface CreateLoanApplicationFormProps {
  bankId?: string;
}

export function CreateLoanApplicationForm({ bankId }: CreateLoanApplicationFormProps) {
  const { form, onSubmit, isSubmitting, visibility } = useCreateLoanApplicationForm({ bankId });
  const t = useTranslations("LoanApplication");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("form.create.title")}</CardTitle>
        <CardDescription>{t("form.create.description")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent>
            <FormFields form={form} visibility={visibility} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("form.submitting") : t("form.submit")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
