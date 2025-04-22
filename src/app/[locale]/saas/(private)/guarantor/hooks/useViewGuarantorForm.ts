import { useAbility } from "@/lib/casl/abilityContext";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { defineGuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility";
import { GuarantorView } from "../schemas/guarantorSchema";
import { formatDate } from "@/lib/displayUtils";

/**
 * Props for the useViewGuarantorForm hook
 */
interface UseViewGuarantorFormProps {
  /**
   * Guarantor data to be displayed
   */
  guarantor: GuarantorView;
}

/**
 * Return type for the useViewGuarantorForm hook
 */
interface UseViewGuarantorFormReturn {
  /**
   * Field visibility settings based on user permissions
   */
  visibility: ReturnType<typeof defineGuarantorFieldVisibility>;

  /**
   * Formatted values for display
   */
  formattedValues: {
    createdAt: string;
    updatedAt: string;
    fullName: string;
    fullAddress: string;
  };

  /**
   * Whether the user has permission to edit the guarantor
   */
  canEdit: boolean;

  /**
   * Whether the user has permission to delete the guarantor
   */
  canDelete: boolean;
}

/**
 * Custom hook to manage the read-only view of a guarantor
 *
 * @param {UseViewGuarantorFormProps} options - Hook configuration options
 * @returns {UseViewGuarantorFormReturn} View state and permissions
 */
export function useViewGuarantorForm({ guarantor }: UseViewGuarantorFormProps): UseViewGuarantorFormReturn {
  const ability = useAbility();
  const t = useTranslations("Guarantor");

  // Compute field visibility based on user permissions
  const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);

  // Format display values
  const formattedValues = useMemo(() => {
    return {
      createdAt: formatDate(guarantor.createdAt),
      updatedAt: formatDate(guarantor.updatedAt),
      fullName: `${guarantor.firstName} ${guarantor.lastName}`,
      fullAddress: [
        guarantor.addressLine1,
        guarantor.addressLine2,
        guarantor.addressCity,
        guarantor.addressState,
        guarantor.addressZipCode,
      ]
        .filter(Boolean)
        .join(", "),
    };
  }, [guarantor]);

  // Check user permissions for actions
  const canEdit = ability.can("update", "Guarantor");
  const canDelete = ability.can("delete", "Guarantor");

  return {
    visibility,
    formattedValues,
    canEdit,
    canDelete,
  };
}
