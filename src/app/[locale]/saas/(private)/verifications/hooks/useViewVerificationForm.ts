import { useAbility } from "@/lib/casl/abilityContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteVerification } from "../actions/deleteVerification";
import { getVerification } from "../actions/getVerification";
import { defineVerificationFieldVisibility } from "../lib/defineVerificationFieldVisibility";
import { FullVerificationView } from "../../verifications/schemas/verificationSchema";

/**
 * Props for the useViewVerificationForm hook
 */
interface UseViewVerificationFormProps {
  /**
   * ID of the verification to view
   */
  verificationId: string;
}

/**
 * Return type for the useViewVerificationForm hook
 */
interface UseViewVerificationFormReturn {
  /**
   * Verification data
   */
  data: FullVerificationView | null;

  /**
   * Field visibility settings based on user permissions
   */
  visibility: ReturnType<typeof defineVerificationFieldVisibility>;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error message if any
   */
  error: string | null;

  /**
   * Handle delete verification
   */
  handleDelete: () => Promise<void>;

  /**
   * Whether deletion is in progress
   */
  isDeleting: boolean;

  /**
   * Refresh the verification data
   */
  refreshData: () => Promise<void>;
}

/**
 * Custom hook to manage the view-only verification display
 *
 * @param {UseViewVerificationFormProps} options - Hook configuration options
 * @returns {UseViewVerificationFormReturn} View state and handlers
 */
export function useViewVerificationForm({
  verificationId,
}: UseViewVerificationFormProps): UseViewVerificationFormReturn {
  const ability = useAbility();
  const router = useRouter();
  const t = useTranslations("Verification");

  const [data, setData] = useState<FullVerificationView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute field visibility based on user permissions
  const visibility = useMemo(() => defineVerificationFieldVisibility(ability), [ability]);

  // Fetch verification data on mount
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getVerification({ id: verificationId });

      if (response.success && response.data) {
        setData(response.data as FullVerificationView);
      } else {
        setError(response.message || "Failed to load verification data");
        toast.error(t("toast.loadError"), {
          description: response.message || t("toast.unexpectedError"),
        });
      }
    } catch (error) {
      console.error("Error loading verification:", error);
      setError("Failed to load verification data");
      toast.error(t("toast.loadError"), {
        description: t("toast.unexpectedError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [verificationId]);

  /**
   * Handles verification deletion
   */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await deleteVerification({ id: verificationId });

      if (response.success) {
        toast.success(t("toast.deleteSuccess"), {
          description: t("toast.deleteSuccessDescription"),
        });

        // Redirect to list page after successful deletion
        router.push("/saas/verification/list");
      } else {
        toast.error(t("toast.deleteError"), {
          description: response.message || t("toast.unexpectedError"),
        });
      }
    } catch (error) {
      console.error("Error deleting verification:", error);
      toast.error(t("toast.deleteError"), {
        description: t("toast.unexpectedError"),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Refreshes verification data
   */
  const refreshData = async () => {
    await fetchData();
  };

  return {
    data,
    visibility,
    isLoading,
    error,
    handleDelete,
    isDeleting,
    refreshData,
  };
}
