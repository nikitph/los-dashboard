import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useAbility } from "@/lib/casl/abilityContext";
import {
  type ApplicationNumberConfigView,
  type CreateApplicationNumberConfigInput,
  createApplicationNumberConfigSchema,
  loanTypeCodeMap,
  separatorDisplayMap,
  type UpdateApplicationNumberConfigInput,
  updateApplicationNumberConfigSchema
} from "../schemas/applicationNumberConfigSchema";
import { defineApplicationNumberConfigFieldVisibility } from "../lib/defineApplicationNumberConfigFieldVisibility";

/**
 * Options for the application number configuration form hook
 */
export interface UseApplicationNumberConfigFormOptions {
  /** Initial data for edit mode */
  initialData?: ApplicationNumberConfigView;
  /** Bank ID for creating new configurations */
  bankId?: string;
  /** Bank name for preview generation */
  bankName?: string;
}

/**
 * Return type for the application number configuration form hook
 */
export interface ApplicationNumberConfigFormHookReturn {
  /** React Hook Form instance */
  form: ReturnType<typeof useForm<CreateApplicationNumberConfigInput | UpdateApplicationNumberConfigInput>>;
  /** Field visibility based on user permissions */
  visibility: ReturnType<typeof defineApplicationNumberConfigFieldVisibility>;
  /** Whether the form is in edit mode */
  isEditMode: boolean;
  /** Default values for the form */
  defaultValues: CreateApplicationNumberConfigInput | UpdateApplicationNumberConfigInput;
  /** Preview of the generated application number */
  previewNumber: string;
  /** Available separator options */
  separatorOptions: Array<{ label: string; value: string; display: string }>;
  /** Available loan type options */
  loanTypeOptions: Array<{ label: string; value: string; code: string }>;
}

/**
 * Custom hook to manage application number configuration form state and submission
 *
 * Handles form initialization, validation, field visibility, and preview generation
 * based on user permissions and provided data.
 *
 * @param options - Hook configuration options
 * @returns Form state, handlers, and computed values
 */
export function useApplicationNumberConfigForm({
  initialData,
  bankId,
  bankName = "Sample Bank",
}: UseApplicationNumberConfigFormOptions): ApplicationNumberConfigFormHookReturn {
  const ability = useAbility();

  // Compute field visibility based on user permissions
  const visibility = useMemo(() => defineApplicationNumberConfigFieldVisibility(ability), [ability]);

  // Determine if this is edit mode
  const isEditMode = Boolean(initialData?.id);

  // Set up default values based on mode
  const defaultValues = useMemo(() => {
    if (isEditMode && initialData) {
      return {
        id: initialData.id,
        bankId: initialData.bankId,
        separator: initialData.separator,
        includePrefix: initialData.includePrefix,
        includeBranch: initialData.includeBranch,
        includeLoanType: initialData.includeLoanType,
        includeDate: initialData.includeDate,
        bankName: initialData.bankName,
        branchNumber: initialData.branchNumber,
        loanTypeCode: initialData.loanTypeCode,
        serialNumberPadding: initialData.serialNumberPadding,
      };
    }

    return {
      bankId: bankId || "",
      separator: "HYPHEN" as const,
      includePrefix: false,
      includeBranch: false,
      includeLoanType: false,
      includeDate: false,
      bankName: bankName,
      branchNumber: "001",
      loanTypeCode: "PL",
      serialNumberPadding: 5,
    };
  }, [isEditMode, initialData, bankId, bankName]);

  // Initialize form with appropriate schema and resolver
  const form = useForm<CreateApplicationNumberConfigInput | UpdateApplicationNumberConfigInput>({
    // @ts-ignore
    resolver: zodResolver(isEditMode ? updateApplicationNumberConfigSchema : createApplicationNumberConfigSchema),
    defaultValues,
    mode: "onChange",
  });

  // Watch form values for preview generation
  const watchedValues = form.watch();

  // Generate separator options for UI
  const separatorOptions = useMemo(
    () => [
      { label: "Hyphen (-)", value: "HYPHEN", display: separatorDisplayMap.HYPHEN },
      { label: "Slash (/)", value: "SLASH", display: separatorDisplayMap.SLASH },
      { label: "Underscore (_)", value: "UNDERSCORE", display: separatorDisplayMap.UNDERSCORE },
      { label: "Dot (.)", value: "DOT", display: separatorDisplayMap.DOT },
      { label: "None", value: "NONE", display: separatorDisplayMap.NONE },
    ],
    [],
  );

  // Generate loan type options for UI
  const loanTypeOptions = useMemo(
    () => [
      { label: "Personal Loan", value: "PERSONAL", code: loanTypeCodeMap.PERSONAL },
      { label: "Vehicle Loan", value: "VEHICLE", code: loanTypeCodeMap.VEHICLE },
      { label: "House Construction", value: "HOUSE_CONSTRUCTION", code: loanTypeCodeMap.HOUSE_CONSTRUCTION },
      {
        label: "Plot & House Construction",
        value: "PLOT_AND_HOUSE_CONSTRUCTION",
        code: loanTypeCodeMap.PLOT_AND_HOUSE_CONSTRUCTION,
      },
      { label: "Plot Purchase", value: "PLOT_PURCHASE", code: loanTypeCodeMap.PLOT_PURCHASE },
      { label: "Mortgage Loan", value: "MORTGAGE", code: loanTypeCodeMap.MORTGAGE },
    ],
    [],
  );

  // Generate preview application number
  const previewNumber = useMemo(() => {
    const parts: string[] = [];
    const separator = separatorDisplayMap[watchedValues.separator as keyof typeof separatorDisplayMap] || "-";

    // Add prefix (first 3 letters of bank name)
    if (watchedValues.includePrefix && watchedValues.bankName) {
      const prefix = watchedValues.bankName.substring(0, 3).toUpperCase();
      parts.push(prefix);
    }

    // Add branch number
    if (watchedValues.includeBranch && watchedValues.branchNumber) {
      parts.push(watchedValues.branchNumber);
    }

    // Add loan type code
    if (watchedValues.includeLoanType && watchedValues.loanTypeCode) {
      parts.push(watchedValues.loanTypeCode);
    }

    // Add date (sample date in DDMMYY format)
    if (watchedValues.includeDate) {
      const sampleDate = new Date();
      const day = sampleDate.getDate().toString().padStart(2, "0");
      const month = (sampleDate.getMonth() + 1).toString().padStart(2, "0");
      const year = sampleDate.getFullYear().toString().slice(-2);
      parts.push(`${day}${month}${year}`);
    }

    // Add serial number (always included)
    const padding = watchedValues.serialNumberPadding || 5;
    const serialNumber = "1".padStart(padding, "0");
    parts.push(serialNumber);

    // Join with separator, or just concatenate if no separator
    // @ts-ignore
    return separator === "" ? parts.join("") : parts.join(separator);
  }, [watchedValues]);

  return {
    form,
    visibility,
    isEditMode,
    defaultValues,
    previewNumber,
    separatorOptions,
    loanTypeOptions,
  };
}
