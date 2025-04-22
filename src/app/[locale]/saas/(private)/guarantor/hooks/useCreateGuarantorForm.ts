import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAbility } from "@/lib/casl/abilityContext";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { defineGuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility";
import { CreateGuarantorInput, createGuarantorSchema } from "../schemas/guarantorSchema";
import { createGuarantor } from "../actions/createGuarantor";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Props for the useCreateGuarantorForm hook
 */
interface UseCreateGuarantorFormProps {
  /**
   * ID of the loan application that this guarantor is associated with
   */
  loanApplicationId: string;
}

/**
 * Return type for the useCreateGuarantorForm hook
 */
interface UseCreateGuarantorFormReturn {
  /**
   * React Hook Form instance for the guarantor form
   */
  form: ReturnType<typeof useForm<CreateGuarantorInput>>;

  /**
   * Field visibility settings based on user permissions
   */
  visibility: ReturnType<typeof defineGuarantorFieldVisibility>;

  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;

  /**
   * Handler for form submission
   */
  onSubmit: (data: CreateGuarantorInput) => Promise<void>;
}

/**
 * Custom hook to manage the guarantor creation form state and submission
 *
 * @param {UseCreateGuarantorFormProps} options - Hook configuration options
 * @returns {UseCreateGuarantorFormReturn} Form state and handlers
 */
export function useCreateGuarantorForm({
  loanApplicationId,
}: UseCreateGuarantorFormProps): UseCreateGuarantorFormReturn {
  const ability = useAbility();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("Guarantor");

  // Compute field visibility based on user permissions
  const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);

  // Initialize form with default values
  const form = useForm<CreateGuarantorInput>({
    resolver: zodResolver(createGuarantorSchema),
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
      loanApplicationId,
    },
  });

  /**
   * Handles form submission
   *
   * @param {CreateGuarantorInput} data - Validated form data
   */
  const onSubmit = async (data: CreateGuarantorInput) => {
    try {
      setIsSubmitting(true);

      const response = await createGuarantor(data);

      if (response.success) {
        toast.success(t("toast.createSuccess"), {
          description: t("toast.createSuccessDescription"),
        });

        // Redirect to view page or list page after successful creation
        router.push(`/saas/guarantor/list`);
      } else {
        // Handle form errors
        handleFormErrors(response, form.setError);
      }
    } catch (error) {
      console.error("Error creating guarantor:", error);
      toast.error(t("toast.createError"), {
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
    onSubmit,
  };
}
