import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { useUpdateLoanApplicationForm } from "../hooks/useUpdateLoanApplicationForm";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";
import { FormFields } from "./FormFields";

interface UpdateLoanApplicationFormProps {
  initialData: LoanApplicationView;
}

export function UpdateLoanApplicationForm({ initialData }: UpdateLoanApplicationFormProps) {
  const { form, onSubmit, isSubmitting, visibility } = useUpdateLoanApplicationForm({ initialData });
  const t = useTranslations("LoanApplication");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("form.update.title")}</CardTitle>
        <CardDescription>{t("form.update.description")}</CardDescription>
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
