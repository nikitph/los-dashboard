import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAbility } from "@/lib/casl/abilityContext";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { defineGuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility";
import { GuarantorView, UpdateGuarantorInput, updateGuarantorSchema } from "../schemas/guarantorSchema";
import { updateGuarantor } from "../actions/updateGuarantor";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Props for the useUpdateGuarantorForm hook
 */
interface UseUpdateGuarantorFormProps {
  /**
   * Initial guarantor data for editing
   */
  initialData: GuarantorView;
}

/**
 * Return type for the useUpdateGuarantorForm hook
 */
interface UseUpdateGuarantorFormReturn {
  /**
   * React Hook Form instance for the guarantor form
   */
  form: ReturnType<typeof useForm<UpdateGuarantorInput>>;

  /**
   * Field visibility settings based on user permissions
   */
  visibility: ReturnType<typeof defineGuarantorFieldVisibility>;

  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;

  /**
   * Whether the current mode is edit mode (always true for this hook)
   */
  isEditMode: boolean;

  /**
   * Handler for form submission
   */
  onSubmit: (data: UpdateGuarantorInput) => Promise<void>;
}

/**
 * Custom hook to manage the guarantor update form state and submission
 *
 * @param {UseUpdateGuarantorFormProps} options - Hook configuration options
 * @returns {UseUpdateGuarantorFormReturn} Form state and handlers
 */
export function useUpdateGuarantorForm({ initialData }: UseUpdateGuarantorFormProps): UseUpdateGuarantorFormReturn {
  const ability = useAbility();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("Guarantor");

  // Compute field visibility based on user permissions
  const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);

  // Initialize form with data from the guarantor
  const form = useForm<UpdateGuarantorInput>({
    resolver: zodResolver(updateGuarantorSchema),
    defaultValues: {
      id: initialData.id,
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      addressState: initialData.addressState,
      addressCity: initialData.addressCity,
      addressZipCode: initialData.addressZipCode,
      addressLine1: initialData.addressLine1,
      addressLine2: initialData.addressLine2 || undefined,
      mobileNumber: initialData.mobileNumber,
      loanApplicationId: initialData.loanApplicationId,
    },
  });

  /**
   * Handles form submission for updating the guarantor
   *
   * @param {UpdateGuarantorInput} data - Validated form data
   */
  const onSubmit = async (data: UpdateGuarantorInput) => {
    try {
      setIsSubmitting(true);

      const response = await updateGuarantor(data);

      if (response.success) {
        toast.success(t("toast.updateSuccess"), {
          description: t("toast.updateSuccessDescription"),
        });

        // Redirect to view page after successful update
        router.push(`/saas/guarantor/${initialData.id}/view`);
      } else {
        // Handle form errors
        handleFormErrors(response, form.setError);
      }
    } catch (error) {
      console.error("Error updating guarantor:", error);
      toast.error(t("toast.updateError"), {
        description: t("toast.unexpectedError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    visibility,
    isSubmitting,
    isEditMode: true,
    onSubmit,
  };
}
