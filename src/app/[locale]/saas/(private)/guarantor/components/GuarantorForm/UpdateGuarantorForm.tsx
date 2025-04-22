import { useTranslations } from "next-intl";
import { useUpdateGuarantorForm } from "../../hooks/useUpdateGuarantorForm";
import { GuarantorFormFields } from "./GuarantorFormFields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { GuarantorView } from "../../schemas/guarantorSchema";

/**
 * Props for the UpdateGuarantorForm component
 */
interface UpdateGuarantorFormProps {
  /**
   * Initial guarantor data for editing
   */
  guarantor: GuarantorView;
}

/**
 * Form component for updating an existing guarantor
 * Uses the useUpdateGuarantorForm hook to manage form state and submission
 *
 * @param {UpdateGuarantorFormProps} props - Component props
 * @returns {JSX.Element} Update guarantor form component
 */
export function UpdateGuarantorForm({ guarantor }: UpdateGuarantorFormProps): React.ReactNode {
  const t = useTranslations("Guarantor");
  const { form, visibility, isSubmitting, onSubmit } = useUpdateGuarantorForm({
    initialData: guarantor,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("form.edit.title")}</CardTitle>
        <CardDescription>
          {t("form.edit.description", { name: `${guarantor.firstName} ${guarantor.lastName}` })}
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <GuarantorFormFields control={form.control} visibility={visibility} />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/saas/guarantor/${guarantor.id}/view`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("form.buttons.cancel")}
              </Link>
            </Button>

            <Button type="submit" disabled={isSubmitting || !visibility.canUpdate}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("form.buttons.saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("form.buttons.save")}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
