"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { getIncome } from "../actions/getIncome";
import { deleteIncome } from "../actions/deleteIncome";
import { useAbility } from "@/lib/casl/abilityContext";

/**
 * Hook for managing the view income form
 * @param incomeId - The ID of the income record to view
 * @returns State and handlers for the view income form
 */
export function useViewIncomeForm(incomeId: string) {
  const [income, setIncome] = useState<any>(null);
  const [years, setYears] = useState<number[]>([]);
  const [activeYear, setActiveYear] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const t = useTranslations("Income");
  const { toast } = useToast();
  const ability = useAbility();

  // Fetch income data on component mount
  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const response = await getIncome(incomeId);

        if (response.success && response.data) {
          const incomeData = response.data;
          setIncome(incomeData);

          // Initialize years array based on income details
          if (incomeData.incomeDetails && incomeData.incomeDetails.length > 0) {
            const yearValues = incomeData.incomeDetails.map((detail: any) => detail.year);
            setYears(yearValues);
            setActiveYear(yearValues[0]);
          }
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
  }, [incomeId, router, t, toast]);

  /**
   * Handles income deletion
   */
  const handleDelete = async () => {
    if (!ability.can("delete", "Income")) {
      toast({
        title: t("permissionDenied"),
        description: t("noDeletePermission"),
        variant: "destructive",
      });
      return;
    }

    if (!confirm(t("confirmDelete"))) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await deleteIncome(incomeId);

      if (response.success) {
        toast({
          title: t("success"),
          description: t("deleteSuccess"),
        });

        // Navigate to the incomes list or applicant page
        if (income?.applicantId) {
          router.push(`/saas/(private)/applicant/${income.applicantId}`);
        } else {
          router.push("/saas/(private)/incomes");
        }
        router.refresh();
      } else {
        toast({
          title: t("error"),
          description: response.message || t("deleteError"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting income:", error);
      toast({
        title: t("error"),
        description: t("unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handles navigation to the edit page
   */
  const handleEdit = () => {
    if (!ability.can("update", "Income")) {
      toast({
        title: t("permissionDenied"),
        description: t("noUpdatePermission"),
        variant: "destructive",
      });
      return;
    }

    router.push(`/saas/(private)/incomes/${incomeId}/edit`);
  };

  /**
   * Calculates the gross cash income for a specific income detail
   * @param incomeDetail - The income detail to calculate gross cash income for
   * @returns The calculated gross cash income
   */
  const calculateGrossCashIncome = (incomeDetail: any) => {
    const grossIncome = incomeDetail.grossIncome || 0;
    const rentalIncome = incomeDetail.rentalIncome || 0;
    const businessIncome = incomeDetail.incomeFromBusiness || 0;
    const depreciation = incomeDetail.depreciation || 0;

    return grossIncome + rentalIncome + businessIncome + depreciation;
  };

  return {
    income,
    years,
    activeYear,
    setActiveYear,
    isLoading,
    isDeleting,
    calculateGrossCashIncome,
    handleDelete,
    handleEdit,
    canUpdate: ability.can("update", "Income"),
    canDelete: ability.can("delete", "Income"),
  };
}
