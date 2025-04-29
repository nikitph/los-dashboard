"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "next-intl";
import {
  emptyLoanObligation,
  emptyLoanObligationDetail,
  LoanObligationFormValues,
  loanObligationSchema,
} from "../schemas/loanObligationSchema";
import { getLoanObligation, saveLoanObligation } from "../actions/loanObligationActions";

interface UseLoanObligationFormProps {
  applicantId: string;
  initialData?: LoanObligationFormValues;
  onSuccess?: (data: any) => void;
  redirectPath?: string;
}

export function useLoanObligationForm({
  applicantId,
  initialData,
  onSuccess,
  redirectPath,
}: UseLoanObligationFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string> | null>(null);
  const t = useTranslations("LoanObligations");

  // Initialize the form
  const form = useForm<LoanObligationFormValues>({
    resolver: zodResolver(loanObligationSchema),
    defaultValues: initialData || emptyLoanObligation,
    mode: "onBlur",
  });

  // Set up field array for dynamic loans
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "loans",
  });

  // Watch for changes to calculate totals
  const loans = form.watch("loans");

  // Fetch initial data if not provided through props
  useEffect(() => {
    if (!initialData && applicantId) {
      const fetchData = async () => {
        try {
          const response = await getLoanObligation(applicantId);
          if (response.success && response.data) {
            form.reset(response.data);
          } else if (!response.success) {
            toast({
              title: t("toast.error"),
              description: response.message,
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: t("toast.error"),
            description: t("errors.unexpected"),
            variant: "destructive",
          });
        }
      };

      fetchData();
    }
  }, [applicantId, form, initialData, toast, t]);

  // Calculate totals
  const calculateTotalLoan = () => {
    return loans.reduce((total, loan) => total + Number(loan.outstandingLoan || 0), 0);
  };

  const calculateTotalEmi = () => {
    return loans.reduce((total, loan) => total + Number(loan.emiAmount || 0), 0);
  };

  // Handle form submission
  const onSubmit = async (data: LoanObligationFormValues) => {
    setIsSubmitting(true);
    setServerErrors(null);

    try {
      const response = await saveLoanObligation(applicantId, data);

      if (response.success) {
        toast({
          title: t("toast.success"),
          description: t(initialData ? "toast.updated" : "toast.created"),
        });

        if (onSuccess) {
          onSuccess(response.data);
        } else if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.push(`/${locale}/saas/income`);
        }
      } else {
        // Handle errors from the server
        if (response.errors) {
          setServerErrors(response.errors);

          // Set form errors from server response
          Object.entries(response.errors).forEach(([path, message]) => {
            form.setError(path as any, {
              type: "server",
              message: t(message as any) || message,
            });
          });
        }

        toast({
          title: t("errors.validationFailed"),
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("toast.error"),
        description: t("errors.unexpected"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLoan = () => {
    append(emptyLoanObligationDetail);
  };

  const removeLoan = (index: number) => {
    remove(index);
  };

  return {
    form,
    fields,
    isSubmitting,
    serverErrors,
    onSubmit: form.handleSubmit(onSubmit),
    addLoan,
    removeLoan,
    calculateTotalLoan,
    calculateTotalEmi,
  };
}
