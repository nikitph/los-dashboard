"use client";

import { useAbility } from "@/lib/casl/abilityContext";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { createVerification } from "../actions/createVerification";
import { defineVerificationFieldVisibility } from "../lib/defineVerificationFieldVisibility";
import {
  CreateFullVerificationInput,
  createFullVerificationSchema,
  VerificationFormValues
} from "../../verifications/schemas/verificationSchema";
import { VerificationType } from "@prisma/client";
import { toastError, toastSuccess } from "@/lib/toastUtils";

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
  secondary?: boolean;
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

  /**
   * Formatted date values for date input fields
   */
  formattedDate: {
    day: string;
    month: string;
    year: string;
  };
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
  secondary = true,
}: UseCreateVerificationFormProps): UseCreateVerificationFormReturn {
  const ability = useAbility();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("Verification");
  const [selectedType, setSelectedType] = useState<VerificationType>(defaultType);
  const locale = useLocale();

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
      // Initialize based on verification type
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
      // Initialize business verification fields when defaultType is BUSINESS
      ...(defaultType === "BUSINESS" && {
        businessVerification: {
          businessName: "",
          businessType: "Proprietorship",
          natureOfBusiness: "Trading",
          contactDetails: "",
          salesPerDay: "5,000-10,000",
          businessExistence: true,
          addressLine1: "",
          addressLine2: "",
          addressCity: "",
          addressState: "",
          addressZipCode: "",
          locationFromMain: "",
        },
      }),
      // Initialize vehicle verification fields when defaultType is VEHICLE
      ...(defaultType === "VEHICLE" && {
        vehicleVerification: {
          engineNumber: "",
          chassisNumber: "",
          registrationNumber: "",
          make: "",
          model: "",
          vehicleType: "Sedan",
        },
      }),
      // Initialize property verification fields when defaultType is PROPERTY
      ...(defaultType === "PROPERTY" && {
        propertyVerification: {
          ownerFirstName: "",
          ownerLastName: "",
          structureType: "Commercial",
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

  // Get the verification date for formatting
  const verificationDate = form.watch("verification.verificationDate");

  // Format date for use in the component
  const formattedDate = useMemo(() => {
    return {
      day: verificationDate ? format(verificationDate, "dd") : "",
      month: verificationDate ? format(verificationDate, "MM") : "",
      year: verificationDate ? format(verificationDate, "yyyy") : "",
    };
  }, [verificationDate]);

  // Update selectedType when the form value changes
  useMemo(() => {
    if (typeWatch && typeWatch !== selectedType) {
      setSelectedType(typeWatch);
    }
  }, [typeWatch, selectedType]);

  /**
   * Prepares data for server submission based on the verification type
   *
   * @param {VerificationFormValues} data - Form data
   * @returns {CreateFullVerificationInput} Data ready for API submission
   */
  const prepareSubmitData = useCallback((data: VerificationFormValues): CreateFullVerificationInput => {
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

    return submitData;
  }, []);

  /**
   * Handles form submission
   *
   * @param {VerificationFormValues} data - Validated form data
   */
  const onSubmit = async (data: VerificationFormValues) => {
    try {
      setIsSubmitting(true);

      // Ensure vehicle verification data is properly set if this is a vehicle verification
      if (data.verification.type === "VEHICLE" && !data.vehicleVerification) {
        data.vehicleVerification = {
          engineNumber: "",
          chassisNumber: "",
          registrationNumber: "",
          make: "",
          model: "",
          vehicleType: "Sedan",
        };
      }

      const submitData = prepareSubmitData(data);
      const response = await createVerification(submitData);

      if (response.success) {
        toastSuccess({
          title: t("toast.createSuccess"),
          description: t("toast.createSuccessDescription"),
        });

        // Redirect to view page after successful creation
        if (response.data?.id) {
          secondary
            ? router.push(`/${locale}/saas/verifications/complete?lid=${loanApplicationId}`)
            : router.push(`/${locale}/saas/verifications/secondary?lid=${loanApplicationId}`);
        } else {
          router.push(`/${locale}/saas/verification/list`);
        }
      } else {
        // Handle form errors
        handleFormErrors(response, form.setError);
      }
    } catch (error) {
      console.error("Error creating verification:", error);
      toastError({
        title: t("toast.createError"),
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
    formattedDate,
  };
}
