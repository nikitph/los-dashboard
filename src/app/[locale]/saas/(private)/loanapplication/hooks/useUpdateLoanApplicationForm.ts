import { useToast } from "@/hooks/use-toast";
import { useAbility } from "@/lib/casl/abilityContext";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { updateLoanApplication } from "../actions/updateLoanApplication";
import { defineLoanApplicationFieldVisibility } from "../lib/defineLoanApplicationFieldVisibility";
import {
  LoanApplicationView,
  UpdateLoanApplicationInput,
  updateLoanApplicationSchema,
} from "../schemas/loanApplicationSchema";

export function useUpdateLoanApplicationForm(props: { initialData: LoanApplicationView }) {
  const { initialData } = props;
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("LoanApplication");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ability = useAbility();
  const visibility = useMemo(() => defineLoanApplicationFieldVisibility(ability), [ability]);

  const defaultValues = {
    id: initialData.id,
    applicantId: initialData.applicantId,
    bankId: initialData.bankId,
    loanType: initialData.loanType,
    amountRequested: initialData.amountRequested,
    status: initialData.status,
  };

  const form = useForm({
    resolver: zodResolver(updateLoanApplicationSchema),
    defaultValues,
  });

  const onSubmit = async (data: UpdateLoanApplicationInput) => {
    setIsSubmitting(true);
    try {
      const response = await updateLoanApplication(data);
      if (response.success) {
        toast({
          title: t("toast.updated"),
          description: t("toast.updatedDescription"),
        });
        router.push(`/${locale}/saas/loanapplication/${initialData.id}/view`);
      } else {
        handleFormErrors(response, form.setError, t);
      }
    } catch (error) {
      console.error("Error updating loan application:", error);
      toast({
        title: t("toast.error"),
        description: t("toast.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    visibility,
    isEditMode: true,
    initialData,
  };
}
