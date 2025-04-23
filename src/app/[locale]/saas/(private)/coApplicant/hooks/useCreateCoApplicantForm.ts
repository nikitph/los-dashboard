import { useAbility } from "@/lib/casl/abilityContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { handleFormErrors } from "@/lib/formErrorHelper";
import { createCoApplicant } from "../actions/createCoApplicant";
import { defineCoApplicantFieldVisibility } from "../lib/defineCoApplicantFieldVisibility";
import { CreateCoApplicantInput, createCoApplicantSchema } from "../schemas/coApplicantSchema";

/**
 * Options for the useCreateCoApplicantForm hook
 */
interface UseCreateCoApplicantFormOptions {
  loanApplicationId: string;
  onSuccess?: (data: any) => void;
  redirectOnSuccess?: boolean;
}

/**
 * Custom hook for managing CoApplicant creation form
 *
 * @param {UseCreateCoApplicantFormOptions} options - Configuration options
 * @returns {object} Form state, methods, and visibility map
 */
export function useCreateCoApplicantForm({
  loanApplicationId,
  onSuccess,
  redirectOnSuccess = true,
}: UseCreateCoApplicantFormOptions) {
  const t = useTranslations("CoApplicant");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get field visibility based on user's permissions
  const ability = useAbility();
  const visibility = useMemo(() => defineCoApplicantFieldVisibility(ability), [ability]);

  // Initialize form with defaults
  const form = useForm<CreateCoApplicantInput>({
    resolver: zodResolver(createCoApplicantSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      addressState: "",
      addressCity: "",
      addressZipCode: "",
      addressLine1: "",
      addressLine2: "",
      mobileNumber: "",
      loanApplicationId: loanApplicationId,
    },
  });

  // Form submission handler
  const handleSubmit = async (data: CreateCoApplicantInput) => {
    try {
      setIsSubmitting(true);

      const result = await createCoApplicant(data);

      if (result.success) {
        toast.success(t("toast.created"));

        if (onSuccess) {
          onSuccess(result.data);
        }

        if (redirectOnSuccess) {
          // Redirect to co-applicant view page
          router.push(`/saas/coApplicant/${result.data.id}/view`);
        }
      } else {
        // Handle form errors
        handleFormErrors(result, form.setError, t);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(t("errors.unexpected"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    visibility,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}
