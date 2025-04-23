import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormProvider } from "react-hook-form";
import { useUpdateCoApplicantForm } from "../hooks/useUpdateCoApplicantForm";
import { CoApplicantView } from "../schemas/coApplicantSchema";
import { FormFields } from "./FormFields";

/**
 * UpdateCoApplicantForm component props
 */
interface UpdateCoApplicantFormProps {
  initialData: CoApplicantView;
  onSuccess?: (data: any) => void;
  redirectOnSuccess?: boolean;
}

/**
 * Form component for updating an existing CoApplicant
 *
 * @param {UpdateCoApplicantFormProps} props - Component properties including initialData
 * @returns {JSX.Element} Form for updating a CoApplicant
 */
export function UpdateCoApplicantForm({
  initialData,
  onSuccess,
  redirectOnSuccess = true,
}: UpdateCoApplicantFormProps) {
  const t = useTranslations("CoApplicant");

  const { form, handleSubmit, visibility, isSubmitting } = useUpdateCoApplicantForm({
    initialData,
    onSuccess,
    redirectOnSuccess,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("form.update.title")}</CardTitle>
        <CardDescription>{t("form.update.description")}</CardDescription>
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
              {t("form.update")}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
