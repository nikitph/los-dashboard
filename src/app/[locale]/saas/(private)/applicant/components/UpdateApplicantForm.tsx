import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TriangleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpdateApplicantForm } from "../hooks/useUpdateApplicantForm";
import { ApplicantView } from "../schemas/applicantSchema";
import { FormFields } from "./FormFields";

type UpdateApplicantFormProps = {
  initialData: ApplicantView;
  readOnly?: boolean;
};

/**
 * Form component for updating an existing applicant
 */
export function UpdateApplicantForm({ initialData, readOnly = false }: UpdateApplicantFormProps) {
  const t = useTranslations("Applicant");
  const { form, visibility, isSubmitting, onSubmit } = useUpdateApplicantForm(initialData);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{readOnly ? t("form.view.title") : t("form.edit.title")}</CardTitle>
        <CardDescription>{readOnly ? t("form.view.description") : t("form.edit.description")}</CardDescription>
      </CardHeader>

      {/* Show an alert for deleted applicants */}
      {initialData.deletedAt && (
        <div className="px-6 pb-3">
          <Alert variant="destructive">
            <TriangleIcon className="h-4 w-4" />
            <AlertTitle>{t("form.alert.deleted.title")}</AlertTitle>
            <AlertDescription>{t("form.alert.deleted.description")}</AlertDescription>
          </Alert>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent>
            <FormFields form={form} visibility={visibility} readOnly={readOnly} isEditMode={true} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              {readOnly ? t("form.actions.back") : t("form.actions.cancel")}
            </Button>

            {!readOnly && (
              <Button type="submit" loading={isSubmitting}>
                {t("form.actions.update")}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
