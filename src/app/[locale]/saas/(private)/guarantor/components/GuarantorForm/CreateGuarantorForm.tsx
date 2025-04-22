import { useTranslations } from "next-intl";
import { useCreateGuarantorForm } from "../../hooks/useCreateGuarantorForm";
import { GuarantorFormFields } from "./GuarantorFormFields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

/**
 * Props for the CreateGuarantorForm component
 */
interface CreateGuarantorFormProps {
  /**
   * ID of the loan application this guarantor is associated with
   */
  loanApplicationId: string;
}

/**
 * Form component for creating a new guarantor
 * Uses the useCreateGuarantorForm hook to manage form state and submission
 *
 * @param {CreateGuarantorFormProps} props - Component props
 * @returns {JSX.Element} Create guarantor form component
 */
export function CreateGuarantorForm({ loanApplicationId }: CreateGuarantorFormProps): JSX.Element {
  const t = useTranslations("Guarantor");
  const { form, visibility, isSubmitting, onSubmit } = useCreateGuarantorForm({
    loanApplicationId,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("form.create.title")}</CardTitle>
        <CardDescription>{t("form.create.description")}</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <GuarantorFormFields control={form.control} visibility={visibility} />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/saas/guarantor/list">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("form.buttons.cancel")}
              </Link>
            </Button>

            <Button type="submit" disabled={isSubmitting || !visibility.canCreate}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("form.buttons.creating")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("form.buttons.create")}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
