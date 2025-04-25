import { useToast } from "@/hooks/use-toast";
import { useAbility } from "@/lib/casl/abilityContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deleteApplicant } from "../actions/deleteApplicant";
import { defineApplicantFieldVisibility } from "../lib/defineApplicantFieldVisibility";
import { formatAadharForDisplay, formatPanForDisplay } from "../lib/helpers";
import { ApplicantView } from "../schemas/applicantSchema";

/**
 * Custom hook for managing the view-only applicant display
 *
 * @param applicant - The applicant data to display
 * @returns Field visibility, derived fields, and action handlers
 */
export function useViewApplicantForm(applicant: ApplicantView | null) {
  const t = useTranslations("Applicant");
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get user ability and calculate field visibility
  const ability = useAbility();
  const visibility = useMemo(() => defineApplicantFieldVisibility(ability), [ability]);

  // Derived and formatted values for display
  const formattedValues = useMemo(() => {
    if (!applicant) return {};

    return {
      maskedAadhar: applicant.aadharNumber ? formatAadharForDisplay(applicant.aadharNumber) : null,
      maskedPan: applicant.panNumber ? formatPanForDisplay(applicant.panNumber) : null,
      fullAddress:
        applicant.fullAddress ||
        [applicant.addressFull, applicant.addressCity, applicant.addressState, applicant.addressPinCode]
          .filter(Boolean)
          .join(", "),
      createdAt: applicant.formattedCreatedAt || applicant.createdAt?.toLocaleString(),
      dateOfBirth: applicant.formattedDateOfBirth || applicant.dateOfBirth?.toLocaleDateString(),
    };
  }, [applicant]);

  /**
   * Handles the applicant delete action
   */
  const handleDelete = async () => {
    if (!applicant) return;

    setIsDeleting(true);

    try {
      const response = await deleteApplicant(applicant.id);

      if (response.success) {
        toast({
          title: t("toast.deleteSuccess"),
          description: t("toast.deleteSuccessDescription"),
        });

        // Navigate back to the list page after successful deletion
        router.push("/applicant/list");
      } else {
        toast({
          title: t("toast.deleteError"),
          description: response.message || t("toast.deleteErrorDescription"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting applicant:", error);
      toast({
        title: t("toast.deleteError"),
        description: t("toast.deleteErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /**
   * Navigates to the edit page for this applicant
   */
  const handleEdit = () => {
    if (!applicant) return;
    router.push(`/applicant/${applicant.id}/edit`);
  };

  return {
    applicant,
    visibility,
    formattedValues,
    isDeleting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDelete,
    handleEdit,
    canEdit: visibility.canUpdateDateOfBirth || visibility.canUpdateAddressState || visibility.canUpdateAadharNumber,
    canDelete: visibility.canDelete,
  };
}
