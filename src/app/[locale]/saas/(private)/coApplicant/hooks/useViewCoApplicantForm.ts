import { useAbility } from "@/lib/casl/abilityContext";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { defineCoApplicantFieldVisibility } from "../lib/defineCoApplicantFieldVisibility";
import { formatFullAddress, formatFullName, formatMobileNumber } from "../lib/helpers";
import { CoApplicantView } from "../schemas/coApplicantSchema";

/**
 * Options for the useViewCoApplicantForm hook
 */
interface UseViewCoApplicantFormOptions {
  data: CoApplicantView;
}

/**
 * Custom hook for viewing CoApplicant details with formatted values
 *
 * @param {UseViewCoApplicantFormOptions} options - Configuration options with CoApplicant data
 * @returns {object} Visibility map and formatted values
 */
export function useViewCoApplicantForm({ data }: UseViewCoApplicantFormOptions) {
  const t = useTranslations("CoApplicant");

  // Get field visibility based on user's permissions
  const ability = useAbility();
  const visibility = useMemo(() => defineCoApplicantFieldVisibility(ability), [ability]);

  // Format values for display
  const formattedValues = useMemo(() => {
    return {
      fullName: formatFullName(data.firstName, data.lastName),
      formattedMobileNumber: formatMobileNumber(data.mobileNumber),
      fullAddress: formatFullAddress({
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        addressCity: data.addressCity,
        addressState: data.addressState,
        addressZipCode: data.addressZipCode,
      }),
      createdAt:
        data.createdAt instanceof Date
          ? data.createdAt.toLocaleDateString()
          : new Date(data.createdAt).toLocaleDateString(),
      updatedAt:
        data.updatedAt instanceof Date
          ? data.updatedAt.toLocaleDateString()
          : new Date(data.updatedAt).toLocaleDateString(),
    };
  }, [data]);

  // Define sections to display
  const sections = [
    {
      id: "basic",
      title: t("form.sections.basic"),
      fields: [
        {
          id: "fullName",
          label: t("form.fullName"),
          value: formattedValues.fullName,
          visible: visibility.firstName && visibility.lastName,
        },
        { id: "email", label: t("form.email"), value: data.email, visible: visibility.email },
        {
          id: "mobileNumber",
          label: t("form.mobileNumber"),
          value: formattedValues.formattedMobileNumber,
          visible: visibility.mobileNumber,
        },
      ],
    },
    {
      id: "address",
      title: t("form.sections.address"),
      fields: [
        {
          id: "fullAddress",
          label: t("form.fullAddress"),
          value: formattedValues.fullAddress,
          visible: visibility.addressLine1,
        },
        { id: "addressCity", label: t("form.addressCity"), value: data.addressCity, visible: visibility.addressCity },
        {
          id: "addressState",
          label: t("form.addressState"),
          value: data.addressState,
          visible: visibility.addressState,
        },
        {
          id: "addressZipCode",
          label: t("form.addressZipCode"),
          value: data.addressZipCode,
          visible: visibility.addressZipCode,
        },
      ],
    },
    {
      id: "metadata",
      title: t("form.sections.metadata"),
      fields: [
        {
          id: "createdAt",
          label: t("form.createdAt"),
          value: formattedValues.createdAt,
          visible: visibility.createdAt,
        },
        {
          id: "updatedAt",
          label: t("form.updatedAt"),
          value: formattedValues.updatedAt,
          visible: visibility.updatedAt,
        },
        {
          id: "loanApplicationId",
          label: t("form.loanApplicationId"),
          value: data.loanApplicationId,
          visible: visibility.loanApplicationId,
        },
      ],
    },
  ];

  return {
    data,
    visibility,
    formattedValues,
    sections,
    canUpdate: visibility.canUpdate,
    canDelete: visibility.canDelete,
  };
}
