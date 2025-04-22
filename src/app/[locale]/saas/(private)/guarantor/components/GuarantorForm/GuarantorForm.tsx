import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { updateGuarantor } from "../../actions/updateGuarantor";
import { useUpdateGuarantorForm } from "../../hooks/useGuarantorForm";
import { UpdateGuarantorInput } from "../../schemas/guarantorSchema";
import { FormFields } from "./FormFields";

export interface GuarantorFormProps {
  /** Initial data for editing (optional) */
  initialData?: any;
  /** Loan application ID this guarantor belongs to */
  loanApplicationId: string;
  /** Callback function on successful submit */
  onSuccess?: (data: any) => void;
  /** Callback function on cancel */
  onCancel?: () => void;
}

/**
 * Form component for updating an existing guarantor
 */
export function UpdateGuarantorForm({
  initialData,
  loanApplicationId,
  onSuccess,
  onCancel,
}: GuarantorFormProps & { initialData: any }) {
  // Make initialData required
  const t = useTranslations("guarantor");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize form using the update hook
  const { form, visibility, handleSubmitError } = useUpdateGuarantorForm({
    initialData,
    loanApplicationId,
  });

  // Handle form submission
  const onSubmit = async (values: UpdateGuarantorInput) => {
    setIsSubmitting(true);
    try {
      const response = await updateGuarantor(values);

      if (response.success) {
        toast.success(t("toast.success"), {
          description: t("toast.updated"),
        });

        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        handleSubmitError(response);
        toast.error(t("toast.error"), {
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Error updating guarantor form:", error);
      toast.error(t("toast.error"), {
        description: t("toast.unexpectedError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <FormProvider {...form}>
      <Card>
        <CardHeader>
          <CardTitle>{t("form.editTitle")}</CardTitle>
          <CardDescription>{t("form.editDescription")}</CardDescription>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormFields form={form} visibility={visibility} isEditMode={true} />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              {t("form.cancel")}
            </Button>

            <Button type="submit" disabled={isSubmitting || !visibility.canUpdate}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("form.updating")}
                </>
              ) : (
                t("form.update")
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
