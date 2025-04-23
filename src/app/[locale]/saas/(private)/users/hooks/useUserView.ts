/**
 * Hook for handling user view operations, including approval and rejection
 * of pending user requests.
 *
 * @returns User view state and actions for render-only components
 */
import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { approvePendingAction, rejectPendingAction } from "@/app/[locale]/saas/(private)/users/actions";
import { UserRecord } from "@/app/[locale]/saas/(private)/users/schema";
import { toastError, toastSuccess } from "@/lib/toastUtils";
import { useAbility } from "@/lib/casl/abilityContext";
import { defineUserFieldVisibility } from "../lib/defineUserFieldVisibility";

interface UseUserViewProps {
  user: UserRecord;
  approveMode: boolean;
  onActionComplete?: () => void;
}

export function useUserView({ user, approveMode, onActionComplete }: UseUserViewProps) {
  const router = useRouter();
  const t = useTranslations("Users");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remarksError, setRemarksError] = useState("");

  // Get user field visibility based on CASL ability
  const ability = useAbility();
  const visibility = useMemo(() => defineUserFieldVisibility(ability), [ability]);

  // Derived values
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  // Action handlers
  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
    setRemarks("");
    setRemarksError("");
  };

  const handleRejectSubmit = async () => {
    // Validate remarks
    if (!remarks.trim()) {
      setRemarksError(t("validation.remarks.required"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the server action with the pending action ID and remarks
      await rejectPendingAction(user.id, remarks);

      toastSuccess({
        title: t("form.buttons.reject"),
        description: t("toast.reject.success"),
      });

      // Notify parent component that action is complete
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      toastError({
        title: t("form.buttons.reject"),
        description: t("toast.reject.error"),
      });
    } finally {
      setIsSubmitting(false);
      setIsRejectDialogOpen(false);
    }
  };

  const handleApproveClick = async () => {
    setIsSubmitting(true);

    try {
      const res = await approvePendingAction(user.id);
      console.log("Approval result:", res);

      toastSuccess({
        title: t("form.buttons.approve"),
        description: t("toast.approve.success"),
      });

      // Notify parent component that action is complete
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error("Error approving user:", error);
      toastError({
        title: t("form.buttons.approve"),
        description: t("toast.approve.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    isRejectDialogOpen,
    remarks,
    isSubmitting,
    remarksError,

    // Derived data
    fullName,
    initials,
    visibility,

    // Actions
    setIsRejectDialogOpen,
    setRemarks,
    handleRejectClick,
    handleRejectSubmit,
    handleApproveClick,

    // Translations are provided to the component
    t,
  };
}
