"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { useCreateApplicantForm } from "../hooks/useCreateApplicantForm";
import { FormFields } from "./FormFields";

type CreateApplicantFormProps = {
  defaultBankId?: string;
};

/**
 * Form component for creating a new applicant
 */
export function CreateApplicantForm({ defaultBankId }: CreateApplicantFormProps) {
  const t = useTranslations("Applicant");
  const { form, visibility, isSubmitting, onSubmit } = useCreateApplicantForm(defaultBankId);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{t("form.create.title")}</CardTitle>
        <CardDescription>{t("form.create.description")}</CardDescription>
      </CardHeader>
      <Form {...form} namespace={"Applicant"}>
        <form onSubmit={onSubmit}>
          <CardContent>
            <FormFields form={form as any} visibility={visibility} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              {t("form.actions.cancel")}
            </Button>
            <Button
              type="submit"
              //   loading={isSubmitting}
            >
              {t("form.actions.create")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
