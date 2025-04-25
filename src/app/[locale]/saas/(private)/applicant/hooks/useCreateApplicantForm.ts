"use client";

import { useToast } from "@/hooks/use-toast";
import { useAbility } from "@/lib/casl/abilityContext";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createApplicant } from "../actions/createApplicant";
import { defineApplicantFieldVisibility } from "../lib/defineApplicantFieldVisibility";
import { CreateApplicantInput, createApplicantSchema } from "../schemas/applicantSchema";

/**
 * Custom hook for managing the create applicant form
 *
 * @param defaultBankId - Optional default bank ID to pre-populate
 * @returns Form state, submission handler, and field visibility
 */
export function useCreateApplicantForm(defaultBankId?: string) {
  const t = useTranslations("Applicant");
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user ability and calculate field visibility
  const ability = useAbility();
  const visibility = useMemo(() => defineApplicantFieldVisibility(ability), [ability]);

  // Default values for the form
  const defaultValues: Partial<CreateApplicantInput> = {
    bankId: defaultBankId || "",
    aadharVerificationStatus: false,
    panVerificationStatus: false,
  };

  // Initialize form with Zod resolver
  const form = useForm<CreateApplicantInput>({
    resolver: zodResolver(createApplicantSchema),
    defaultValues,
  });

  /**
   * Handles form submission, calls the create applicant action
   *
   * @param data - Validated form data
   */
  const onSubmit = async (data: CreateApplicantInput) => {
    setIsSubmitting(true);

    try {
      const response = await createApplicant(data);

      if (response.success) {
        toast({
          title: t("toast.createSuccess"),
          description: t("toast.createSuccessDescription"),
        });

        // Navigate to the view page for the new applicant
        router.push(`/applicant/${response.data?.id}/view`);
      } else {
        // Handle validation and other errors
        handleFormErrors(response, form.setError);
      }
    } catch (error) {
      console.error("Error creating applicant:", error);
      toast({
        title: t("toast.createError"),
        description: t("toast.createErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    visibility,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
