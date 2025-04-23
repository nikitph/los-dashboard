"use client";

import { useToast } from "@/hooks/use-toast";
import { useAbility } from "@/lib/casl/abilityContext";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createLoanApplication } from "../actions/createLoanApplication";
import { defineLoanApplicationFieldVisibility } from "../lib/defineLoanApplicationFieldVisibility";
import {
  CreateLoanApplicationInput,
  createLoanApplicationSchema,
  LoanApplicationFormValues
} from "../schemas/loanApplicationSchema";

/**
 * Hook for managing the loan application creation form
 *
 * @param {object} options - Options for initializing the form
 * @param {string} options.bankId - Optional bank ID to pre-populate
 * @returns {object} Form state and handlers
 */
export function useCreateLoanApplicationForm({ bankId }: { bankId?: string } = {}) {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("LoanApplication");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get permissions
  const ability = useAbility();
  const visibility = useMemo(() => defineLoanApplicationFieldVisibility(ability), [ability]);

  // Initialize form with default values
  const defaultValues: LoanApplicationFormValues = {
    applicantId: "",
    bankId: bankId || "",
    loanType: "PERSONAL",
    amountRequested: 0,
    status: "PENDING",
  };

  // Initialize form with validation
  const form = useForm<LoanApplicationFormValues>({
    resolver: zodResolver(createLoanApplicationSchema),
    defaultValues,
  });

  // Form submission handler
  const onSubmit = async (data: CreateLoanApplicationInput) => {
    setIsSubmitting(true);

    try {
      const response = await createLoanApplication(data);

      if (response.success) {
        toast({
          title: t("toast.created"),
          description: t("toast.createdDescription"),
        });

        // Navigate to the list view or detail view
        router.push("/saas/loanapplication/list");
      } else {
        // Handle validation and other errors
        handleFormErrors(response, form.setError, t);
      }
    } catch (error) {
      console.error("Error creating loan application:", error);
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
    isCreateMode: true,
  };
}
