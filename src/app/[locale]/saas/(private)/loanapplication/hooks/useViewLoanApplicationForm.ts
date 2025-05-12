"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAbility } from "@/lib/casl/abilityContext";
import { deleteLoanApplication } from "../actions/deleteLoanApplication";
import { defineLoanApplicationFieldVisibility } from "../lib/defineLoanApplicationFieldVisibility";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";
import { toastError, toastSuccess } from "@/lib/toastUtils";

/**
 * Hook for managing the loan application view form state and actions
 *
 * @param {object} params - Hook parameters
 * @param {LoanApplicationView} params.loanApplication - The loan application data to display
 * @returns {object} Form state and handlers
 */
export function useViewLoanApplicationForm({ loanApplication }: { loanApplication: LoanApplicationView }) {
  const router = useRouter();
  const t = useTranslations("LoanApplication");
  const [isDeleting, setIsDeleting] = useState(false);

  // Get permissions
  const ability = useAbility();
  const visibility = useMemo(() => defineLoanApplicationFieldVisibility(ability), [ability]);

  /**
   * Handles the deletion of the loan application
   * Confirms with the user before proceeding
   */
  const handleDelete = async () => {
    if (!confirm(t("confirm.delete"))) return;

    setIsDeleting(true);
    try {
      const response = await deleteLoanApplication(loanApplication.id);

      if (response.success) {
        toastSuccess({
          title: t("toast.deleted"),
          description: t("toast.deletedDescription"),
        });
        router.push("/saas/loanapplication/list");
      } else {
        toastError({
          title: t("toast.error"),
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Error deleting loan application:", error);
      toastError({
        title: t("toast.error"),
        description: t("toast.errorDescription"),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Formats a date for display
   *
   * @param {Date} date - The date to format
   * @returns {string} Formatted date string
   */
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return {
    loanApplication,
    visibility,
    isDeleting,
    handleDelete,
    formatDate,
  };
}
