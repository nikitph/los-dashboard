import { useAbility } from "@/lib/casl/abilityContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { handleFormErrors } from "@/lib/formErrorHelper";
import { updateCoApplicant } from "../actions/updateCoApplicant";
import { defineCoApplicantFieldVisibility } from "../lib/defineCoApplicantFieldVisibility";
import { UpdateCoApplicantInput, updateCoApplicantSchema } from "../schemas/coApplicantSchema";

/**
 * Options for the useUpdateCoApplicantForm hook
 */
interface UseUpdateCoApplicantFormOptions {
  initialData: any;
  onSuccess?: (data: any) => void;
  redirectOnSuccess?: boolean;
}

/**
 * Custom hook for managing CoApplicant update form
 *
 * @param {UseUpdateCoApplicantFormOptions} options - Configuration options with initial data
 * @returns {object} Form state, methods, and visibility map
 */
export function useUpdateCoApplicantForm({
  initialData,
  onSuccess,
  redirectOnSuccess = true,
}: UseUpdateCoApplicantFormOptions) {
  const t = useTranslations("CoApplicant");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get field visibility based on user's permissions
  const ability = useAbility();
  const visibility = useMemo(() => defineCoApplicantFieldVisibility(ability), [ability]);

  // Initialize form with initial data
  const form = useForm<UpdateCoApplicantInput>({
    resolver: zodResolver(updateCoApplicantSchema),
    defaultValues: {
      id: initialData.id,
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      addressState: initialData.addressState,
      addressCity: initialData.addressCity,
      addressZipCode: initialData.addressZipCode,
      addressLine1: initialData.addressLine1,
      addressLine2: initialData.addressLine2 || "",
      mobileNumber: initialData.mobileNumber,
      loanApplicationId: initialData.loanApplicationId,
    },
  });

  // Form submission handler
  const handleSubmit = async (data: UpdateCoApplicantInput) => {
    try {
      setIsSubmitting(true);

      const result = await updateCoApplicant(data);

      if (result.success) {
        toast.success(t("toast.updated"));

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
      console.error("Error updating form:", error);
      toast.error(t("errors.unexpected"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    visibility,
    isSubmitting,
    isEditMode: true,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}
