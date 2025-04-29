"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { createIncome } from "../actions/createIncome";
import { incomeFormSchema, IncomeFormValues } from "../schemas/incomeSchema";
import { useAbility } from "@/lib/casl/abilityContext";

/**
 * Hook for managing the create income form
 * @param applicantId - The ID of the applicant this income belongs to
 * @returns Form methods, state, and handlers for the create income form
 */
export function useCreateIncomeForm(applicantId: string) {
  const [years, setYears] = useState([1]);
  const [activeYear, setActiveYear] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);

  const router = useRouter();
  const t = useTranslations("Income");
  const { toast } = useToast();
  const ability = useAbility();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      applicantId,
      type: "",
      dependents: 0,
      averageMonthlyExpenditure: 0,
      averageGrossCashIncome: 0,
      incomeDetails: [
        {
          year: 1,
          taxableIncome: null,
          taxPaid: null,
          grossIncome: null,
          rentalIncome: null,
          incomeFromBusiness: null,
          depreciation: null,
          grossCashIncome: null,
        },
      ],
    },
  });

  const watchedType = form.watch("type");
  const watchedIncomeDetails = form.watch("incomeDetails");

  /**
   * Adds a new year to the income details
   */
  const addYear = () => {
    const newYear = years.length + 1;
    setYears((prev) => [...prev, newYear]);
    setActiveYear(newYear);

    // Add a new year with fresh empty values
    form.setValue("incomeDetails", [
      ...watchedIncomeDetails,
      {
        year: newYear,
        taxableIncome: null,
        taxPaid: null,
        grossIncome: null,
        rentalIncome: null,
        incomeFromBusiness: null,
        depreciation: null,
        grossCashIncome: null,
      },
    ]);
  };

  /**
   * Removes the last year from the income details
   */
  const removeYear = () => {
    if (years.length > 1) {
      setYears((prev) => prev.slice(0, -1));
      setActiveYear((prev) => (prev === years.length ? prev - 1 : prev));

      // Remove the last year from incomeDetails array
      const newIncomeDetails = [...watchedIncomeDetails];
      newIncomeDetails.pop();
      form.setValue("incomeDetails", newIncomeDetails);
    }
  };

  /**
   * Calculates the gross cash income for a specific income detail
   * @param incomeDetail - The income detail to calculate gross cash income for
   * @returns The calculated gross cash income
   */
  const calculateGrossCashIncome = (incomeDetail: any) => {
    const grossIncome = parseFloat(incomeDetail.grossIncome) || 0;
    const rentalIncome = parseFloat(incomeDetail.rentalIncome) || 0;
    const businessIncome = parseFloat(incomeDetail.incomeFromBusiness) || 0;
    const depreciation = parseFloat(incomeDetail.depreciation) || 0;

    const grossCashIncome = grossIncome + rentalIncome + businessIncome + depreciation;

    // Don't update the form during rendering to prevent infinite loops
    // The value will be calculated but not stored in the form state

    return grossCashIncome;
  };

  /**
   * Calculates the average gross income across all years
   * @returns The calculated average gross income
   */
  const calculateAverageGrossIncome = () => {
    const totalGrossCashIncome = watchedIncomeDetails.reduce((sum, detail) => {
      const grossCashIncome = detail.grossCashIncome || 0;
      return sum + grossCashIncome;
    }, 0);

    const average = totalGrossCashIncome / watchedIncomeDetails.length;
    form.setValue("averageGrossCashIncome", average);

    return average.toFixed(2);
  };

  /**
   * Handles document upload
   * @param e - The file input change event
   */
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setDocuments((prev) => [...prev, ...newFiles]);
    }
  };

  /**
   * Form submission handler
   * @param data - The form data
   */
  const onSubmit = async (data: IncomeFormValues) => {
    if (!ability.can("create", "Income")) {
      toast({
        title: t("permissionDenied"),
        description: t("noCreatePermission"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for submission
      const formData = new FormData();
      formData.append("applicantId", data.applicantId);
      formData.append("type", data.type);
      formData.append("incomeDetails", JSON.stringify(data.incomeDetails));
      formData.append("dependents", JSON.stringify(data.dependents));
      formData.append("averageMonthlyExpenditure", JSON.stringify(data.averageMonthlyExpenditure));
      formData.append("averageGrossCashIncome", JSON.stringify(data.averageGrossCashIncome));

      // Append documents if any
      documents.forEach((doc, index) => {
        formData.append(`document_${index}`, doc);
      });

      const response = await createIncome(formData);

      if (response.success) {
        toast({
          title: t("success"),
          description: t("createSuccess"),
        });

        // Navigate to the applicant page or income list
        router.push(`/saas/(private)/applicant/${applicantId}`);
        router.refresh();
      } else {
        toast({
          title: t("error"),
          description: response.message || t("createError"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting income form:", error);
      toast({
        title: t("error"),
        description: t("unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    years,
    activeYear,
    setActiveYear,
    isSubmitting,
    documents,
    watchedType,
    watchedIncomeDetails,
    addYear,
    removeYear,
    calculateGrossCashIncome,
    calculateAverageGrossIncome,
    handleDocumentUpload,
    onSubmit,
  };
}
