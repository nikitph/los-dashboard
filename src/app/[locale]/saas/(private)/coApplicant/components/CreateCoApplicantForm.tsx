import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormProvider } from "react-hook-form";
import { useCreateCoApplicantForm } from "../hooks/useCreateCoApplicantForm";
import { FormFields } from "./FormFields";

/**
 * CreateCoApplicantForm component props
 */
interface CreateCoApplicantFormProps {
  loanApplicationId: string;
  onSuccess?: (data: any) => void;
  redirectOnSuccess?: boolean;
}

/**
 * Form component for creating a new CoApplicant
 *
 * @param {CreateCoApplicantFormProps} props - Component properties including loanApplicationId
 * @returns {JSX.Element} Form for creating a CoApplicant
 */
export function CreateCoApplicantForm({
  loanApplicationId,
  onSuccess,
  redirectOnSuccess = true,
}: CreateCoApplicantFormProps) {
  const t = useTranslations("CoApplicant");

  const { form, handleSubmit, visibility, isSubmitting } = useCreateCoApplicantForm({
    loanApplicationId,
    onSuccess,
    redirectOnSuccess,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("form.create.title")}</CardTitle>
        <CardDescription>{t("form.create.description")}</CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <FormFields control={form.control} visibility={visibility} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => window.history.back()}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("form.submit")}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
