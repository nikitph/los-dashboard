"use client";

import { useToast } from "@/hooks/use-toast";
import { useAbility } from "@/lib/casl/abilityContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deleteLoanApplication } from "../actions/deleteLoanApplication";
import { defineLoanApplicationFieldVisibility } from "../lib/defineLoanApplicationFieldVisibility";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";

/**
 * Hook for managing the loan application view state
 *
 * @param {object} options - Options for initializing the view
 * @param {LoanApplicationView} options.loanApplication - Loan application data to display
 * @returns {object} View state and handlers
 */
export function useViewLoanApplicationForm({ loanApplication }: { loanApplication: LoanApplicationView }) {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("LoanApplication");
  const [isDeleting, setIsDeleting] = useState(false);

  // Get permissions
  const ability = useAbility();
  const visibility = useMemo(() => defineLoanApplicationFieldVisibility(ability), [ability]);

  // Delete handler
  const handleDelete = async () => {
    if (!confirm(t("confirm.delete"))) return;

    setIsDeleting(true);
    try {
      const response = await deleteLoanApplication(loanApplication.id);

      if (response.success) {
        toast({
          title: t("toast.deleted"),
          description: t("toast.deletedDescription"),
        });
        router.push("/saas/loanapplication/list");
      } else {
        toast({
          title: t("toast.error"),
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting loan application:", error);
      toast({
        title: t("toast.error"),
        description: t("toast.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    loanApplication,
    visibility,
    isDeleting,
    handleDelete,
  };
}
