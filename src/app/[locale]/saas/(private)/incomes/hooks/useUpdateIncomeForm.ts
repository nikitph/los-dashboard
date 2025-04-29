"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { updateIncome } from "../actions/updateIncome";
import { getIncome } from "../actions/getIncome";
import { incomeFormSchema, IncomeFormValues } from "../schemas/incomeSchema";
import { useAbility } from "@/lib/casl/abilityContext";

/**
 * Hook for managing the update income form
 * @param incomeId - The ID of the income record to update
 * @returns Form methods, state, and handlers for the update income form
 */
export function useUpdateIncomeForm(incomeId: string) {
  const [years, setYears] = useState<number[]>([]);
  const [activeYear, setActiveYear] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<File[]>([]);

  const router = useRouter();
  const t = useTranslations("Income");
  const { toast } = useToast();
  const ability = useAbility();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      id: incomeId,
      applicantId: "",
      type: "",
      dependents: 0,
      averageMonthlyExpenditure: 0,
      averageGrossCashIncome: 0,
      incomeDetails: [],
    },
  });

  const watchedType = form.watch("type");
  const watchedIncomeDetails = form.watch("incomeDetails");

  // Fetch income data on component mount
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const response = await getIncome(incomeId);

        if (response.success && response.data) {
          const incomeData = response.data;

          // Initialize years array based on income details
          const yearValues = incomeData.incomeDetails.map((detail: { year: any }) => detail.year);
          setYears(yearValues);

          if (yearValues.length > 0) {
            setActiveYear(yearValues[0]);
          }

          // Format income details for the form
          const formattedIncomeDetails = incomeData.incomeDetails.map(
            (detail: {
              id: any;
              year: any;
              taxableIncome: { toString: () => any } | null;
              taxPaid: { toString: () => any } | null;
              grossIncome: { toString: () => any } | null;
              rentalIncome: { toString: () => any } | null;
              incomeFromBusiness: { toString: () => any } | null;
              depreciation: { toString: () => any } | null;
              grossCashIncome: { toString: () => any } | null;
            }) => ({
              id: detail.id,
              year: detail.year,
              taxableIncome: detail.taxableIncome !== null ? detail.taxableIncome.toString() : null,
              taxPaid: detail.taxPaid !== null ? detail.taxPaid.toString() : null,
              grossIncome: detail.grossIncome !== null ? detail.grossIncome.toString() : null,
              rentalIncome: detail.rentalIncome !== null ? detail.rentalIncome.toString() : null,
              incomeFromBusiness: detail.incomeFromBusiness !== null ? detail.incomeFromBusiness.toString() : null,
              depreciation: detail.depreciation !== null ? detail.depreciation.toString() : null,
              grossCashIncome: detail.grossCashIncome !== null ? detail.grossCashIncome.toString() : null,
            }),
          );

          // Set form values
          form.reset({
            id: incomeId,
            applicantId: incomeData.applicantId,
            type: incomeData.type,
            dependents: incomeData.dependents.toString(),
            averageMonthlyExpenditure: incomeData.averageMonthlyExpenditure.toString(),
            averageGrossCashIncome: incomeData.averageGrossCashIncome.toString(),
            incomeDetails: formattedIncomeDetails,
          });
        } else {
          toast({
            title: t("error"),
            description: response.message || t("fetchError"),
            variant: "destructive",
          });
          router.push("/saas/(private)/incomes");
        }
      } catch (error) {
        console.error("Error fetching income data:", error);
        toast({
          title: t("error"),
          description: t("unexpectedError"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncomeData();
  }, [incomeId, form, router, t, toast]);

  /**
   * Adds a new year to the income details
   */
  const addYear = () => {
    const existingYears = watchedIncomeDetails.map((detail) => detail.year);
    const newYear = Math.max(...existingYears, 0) + 1;

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
   * Removes the specified year from the income details
   */
  const removeYear = (yearToRemove: number) => {
    if (years.length > 1) {
      setYears((prev) => prev.filter((year) => year !== yearToRemove));

      // Set active year to the first available year if the active year is being removed
      if (activeYear === yearToRemove) {
        const remainingYears = years.filter((year) => year !== yearToRemove);
        setActiveYear(remainingYears[0]);
      }

      // Remove the year from incomeDetails array
      const newIncomeDetails = watchedIncomeDetails.filter((detail) => detail.year !== yearToRemove);
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
    if (!ability.can("update", "Income")) {
      toast({
        title: t("permissionDenied"),
        description: t("noUpdatePermission"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for submission
      const formData = new FormData();
      formData.append("id", incomeId);
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

      const response = await updateIncome(formData);

      if (response.success) {
        toast({
          title: t("success"),
          description: t("updateSuccess"),
        });

        // Navigate to the income view page
        router.push(`/saas/(private)/incomes/${incomeId}/view`);
        router.refresh();
      } else {
        toast({
          title: t("error"),
          description: response.message || t("updateError"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating income form:", error);
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
    isLoading,
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
