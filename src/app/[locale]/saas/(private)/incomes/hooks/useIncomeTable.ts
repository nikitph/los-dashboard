"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { getIncomes } from "../actions/getIncomes";
import { deleteIncome } from "../actions/deleteIncome";
import { useAbility } from "@/lib/casl/abilityContext";

/**
 * Hook for managing the income table
 * @param initialParams - Initial parameters for filtering and pagination
 * @returns State and handlers for the income table
 */
export function useIncomeTable(initialParams?: { applicantId?: string; page?: number; limit?: number }) {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    applicantId: initialParams?.applicantId || "",
  });

  const router = useRouter();
  const t = useTranslations("Income");
  const { toast } = useToast();
  const ability = useAbility();

  // Fetch incomes data when component mounts or filters/pagination changes
  useEffect(() => {
    const fetchIncomes = async () => {
      setIsLoading(true);

      try {
        const response = await getIncomes({
          applicantId: filters.applicantId,
          page: pagination.page,
          limit: pagination.limit,
        });

        if (response.success && response.data) {
          setIncomes(response.data.incomes);
          setPagination(response.data.pagination);
        } else {
          toast({
            title: t("error"),
            description: response.message || t("fetchError"),
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching incomes:", error);
        toast({
          title: t("error"),
          description: t("unexpectedError"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncomes();
  }, [filters, pagination.page, pagination.limit, t, toast]);

  /**
   * Handles changing the page
   * @param page - The page number to navigate to
   */
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  /**
   * Handles changing the page size
   * @param limit - The new page size
   */
  const handleLimitChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  /**
   * Handles filtering by applicant
   * @param applicantId - The applicant ID to filter by
   */
  const handleFilterByApplicant = (applicantId: string) => {
    setFilters((prev) => ({ ...prev, applicantId }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  /**
   * Handles income deletion
   * @param id - The ID of the income to delete
   */
  const handleDelete = async (id: string) => {
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
      const response = await deleteIncome(id);

      if (response.success) {
        toast({
          title: t("success"),
          description: t("deleteSuccess"),
        });

        // Refresh the table data
        const updatedIncomes = incomes.filter((income) => income.id !== id);
        setIncomes(updatedIncomes);

        // Update pagination if needed
        if (updatedIncomes.length === 0 && pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          // Refetch to ensure pagination is correct
          const response = await getIncomes({
            applicantId: filters.applicantId,
            page: pagination.page,
            limit: pagination.limit,
          });

          if (response.success && response.data) {
            setIncomes(response.data.incomes);
            setPagination(response.data.pagination);
          }
        }
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
   * Handles navigation to the view page
   * @param id - The ID of the income to view
   */
  const handleView = (id: string) => {
    router.push(`/saas/(private)/incomes/${id}/view`);
  };

  /**
   * Handles navigation to the edit page
   * @param id - The ID of the income to edit
   */
  const handleEdit = (id: string) => {
    if (!ability.can("update", "Income")) {
      toast({
        title: t("permissionDenied"),
        description: t("noUpdatePermission"),
        variant: "destructive",
      });
      return;
    }

    router.push(`/saas/(private)/incomes/${id}/edit`);
  };

  /**
   * Handles navigation to the create page
   */
  const handleCreate = () => {
    if (!ability.can("create", "Income")) {
      toast({
        title: t("permissionDenied"),
        description: t("noCreatePermission"),
        variant: "destructive",
      });
      return;
    }

    router.push("/saas/(private)/incomes/create");
  };

  return {
    incomes,
    pagination,
    isLoading,
    isDeleting,
    filters,
    handlePageChange,
    handleLimitChange,
    handleFilterByApplicant,
    handleDelete,
    handleView,
    handleEdit,
    handleCreate,
    canCreate: ability.can("create", "Income"),
    canUpdate: ability.can("update", "Income"),
    canDelete: ability.can("delete", "Income"),
  };
}
