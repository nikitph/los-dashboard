import { useAbility } from "@/lib/casl/abilityContext";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createVerification } from "../actions/createVerification";
import { defineVerificationFieldVisibility } from "../lib/defineVerificationFieldVisibility";
import {
  CreateFullVerificationInput,
  createFullVerificationSchema,
  VerificationFormValues
} from "../../verifications/schemas/verificationSchema";
import { VerificationType } from "@prisma/client";

/**
 * Props for the useCreateVerificationForm hook
 */
interface UseCreateVerificationFormProps {
  /**
   * ID of the loan application this verification is associated with
   */
  loanApplicationId: string;

  /**
   * Optional default verification type to pre-select
   */
  defaultType?: VerificationType;
}

/**
 * Return type for the useCreateVerificationForm hook
 */
interface UseCreateVerificationFormReturn {
  /**
   * React Hook Form instance for the verification form
   */
  form: ReturnType<typeof useForm<VerificationFormValues>>;

  /**
   * Field visibility settings based on user permissions
   */
  visibility: ReturnType<typeof defineVerificationFieldVisibility>;

  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;

  /**
   * Handler for form submission
   */
  onSubmit: (data: VerificationFormValues) => Promise<void>;

  /**
   * Currently selected verification type
   */
  selectedType: VerificationType | undefined;
}

/**
 * Custom hook to manage the verification creation form state and submission
 *
 * @param {UseCreateVerificationFormProps} options - Hook configuration options
 * @returns {UseCreateVerificationFormReturn} Form state and handlers
 */
export function useCreateVerificationForm({
  loanApplicationId,
  defaultType = "RESIDENCE",
}: UseCreateVerificationFormProps): UseCreateVerificationFormReturn {
  const ability = useAbility();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("Verification");
  const [selectedType, setSelectedType] = useState<VerificationType>(defaultType);

  // Compute field visibility based on user permissions
  const visibility = useMemo(() => defineVerificationFieldVisibility(ability), [ability]);

  // Initialize form with default values
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(createFullVerificationSchema),
    defaultValues: {
      verification: {
        loanApplicationId,
        type: defaultType,
        status: "PENDING",
        result: false,
        verificationTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        verificationDate: new Date(),
      },
      // Initialize residence verification fields when defaultType is RESIDENCE
      ...(defaultType === "RESIDENCE" && {
        residenceVerification: {
          ownerFirstName: "",
          ownerLastName: "",
          residentSince: "",
          residenceType: "OWNED",
          structureType: "APARTMENT",
          addressLine1: "",
          addressLine2: "",
          addressCity: "",
          addressState: "",
          addressZipCode: "",
          locationFromMain: "",
        },
      }),
    },
  });

  // Watch for type changes to update the selected type
  const typeWatch = form.watch("verification.type");

  // Update selectedType when the form value changes
  useMemo(() => {
    if (typeWatch && typeWatch !== selectedType) {
      setSelectedType(typeWatch);
    }
  }, [typeWatch, selectedType]);

  /**
   * Handles form submission
   *
   * @param {VerificationFormValues} data - Validated form data
   */
  const onSubmit = async (data: VerificationFormValues) => {
    try {
      setIsSubmitting(true);

      // Prepare data for submission
      const submitData: CreateFullVerificationInput = {
        verification: {
          loanApplicationId: data.verification.loanApplicationId,
          type: data.verification.type,
          status: data.verification.status,
          result: data.verification.result,
          remarks: data.verification.remarks,
          verificationDate: data.verification.verificationDate,
          verificationTime: data.verification.verificationTime,
        },
      };

      // Add specific verification type data based on the selected type
      if (data.verification.type === "RESIDENCE" && data.residenceVerification) {
        submitData.residenceVerification = data.residenceVerification;
      } else if (data.verification.type === "BUSINESS" && data.businessVerification) {
        submitData.businessVerification = data.businessVerification;
      } else if (data.verification.type === "PROPERTY" && data.propertyVerification) {
        submitData.propertyVerification = data.propertyVerification;
      } else if (data.verification.type === "VEHICLE" && data.vehicleVerification) {
        submitData.vehicleVerification = data.vehicleVerification;
      }

      const response = await createVerification(submitData);

      if (response.success) {
        toast.success(t("toast.createSuccess"), {
          description: t("toast.createSuccessDescription"),
        });

        // Redirect to view page after successful creation
        if (response.data?.id) {
          router.push(`/saas/verification/${response.data.id}/view`);
        } else {
          router.push(`/saas/verification/list`);
        }
      } else {
        // Handle form errors
        handleFormErrors(response, form.setError);
      }
    } catch (error) {
      console.error("Error creating verification:", error);
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
    selectedType,
  };
}
