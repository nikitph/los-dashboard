import { useAbility } from "@/lib/casl/abilityContext";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { defineGuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility";
import {
  CreateGuarantorInput,
  createGuarantorSchema,
  UpdateGuarantorInput,
  updateGuarantorSchema
} from "../schemas/guarantorSchema";

/**
 * Common props for both guarantor form hooks
 */
interface BaseGuarantorFormProps {
  /** ID of the loan application this guarantor is associated with */
  loanApplicationId: string;
}

/**
 * Props for the useCreateGuarantorForm hook
 */
export interface UseCreateGuarantorFormProps extends BaseGuarantorFormProps {
  /** Initial data (optional) */
  initialData?: Partial<CreateGuarantorInput>;
}

/**
 * Props for the useUpdateGuarantorForm hook
 */
export interface UseUpdateGuarantorFormProps extends BaseGuarantorFormProps {
  /** Initial data for edit mode (required) */
  initialData: Partial<UpdateGuarantorInput> & { id: string };
}

/**
 * Return type for the useCreateGuarantorForm hook
 */
export interface UseCreateGuarantorFormReturn {
  /** The form methods from react-hook-form */
  form: UseFormReturn<CreateGuarantorInput>;
  /** Field visibility map based on user permissions */
  visibility: ReturnType<typeof defineGuarantorFieldVisibility>;
  /** The default values for the form */
  defaultValues: Partial<CreateGuarantorInput>;
  /** Handle form submission errors */
  handleSubmitError: (error: any) => void;
}

/**
 * Return type for the useUpdateGuarantorForm hook
 */
export interface UseUpdateGuarantorFormReturn {
  /** The form methods from react-hook-form */
  form: UseFormReturn<UpdateGuarantorInput>;
  /** Field visibility map based on user permissions */
  visibility: ReturnType<typeof defineGuarantorFieldVisibility>;
  /** The default values for the form */
  defaultValues: Partial<UpdateGuarantorInput>;
  /** Handle form submission errors */
  handleSubmitError: (error: any) => void;
}

/**
 * Legacy combined hook for backward compatibility
 */
export interface UseGuarantorFormProps {
  initialData?: Partial<UpdateGuarantorInput>;
  loanApplicationId: string;
}

export interface UseGuarantorFormReturn {
  form: UseFormReturn<CreateGuarantorInput> | UseFormReturn<UpdateGuarantorInput>;
  visibility: ReturnType<typeof defineGuarantorFieldVisibility>;
  isEditMode: boolean;
  defaultValues: Partial<CreateGuarantorInput> | Partial<UpdateGuarantorInput>;
  handleSubmitError: (error: any) => void;
}

/**
 * Hook for managing the create guarantor form
 *
 * @param {UseCreateGuarantorFormProps} props - Hook configuration
 * @returns {UseCreateGuarantorFormReturn} Form state and handlers
 */
export function useCreateGuarantorForm({
  initialData,
  loanApplicationId,
}: UseCreateGuarantorFormProps): UseCreateGuarantorFormReturn {
  const ability = useAbility();
  const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);

  // Set up default values
  const defaultValues = useMemo(
    () => ({
      ...(initialData || {}),
      loanApplicationId: initialData?.loanApplicationId || loanApplicationId,
    }),
    [initialData, loanApplicationId],
  );

  // Create form instance
  const form = useForm<CreateGuarantorInput>({
    resolver: zodResolver(createGuarantorSchema),
    defaultValues: defaultValues,
  });

  /**
   * Handles form submission errors
   *
   * @param {any} error - The error response from server action
   */
  const handleSubmitError = (error: any) => {
    handleFormErrors<CreateGuarantorInput>(error, form.setError);
  };

  return {
    form,
    visibility,
    defaultValues,
    handleSubmitError,
  };
}

/**
 * Hook for managing the update guarantor form
 *
 * @param {UseUpdateGuarantorFormProps} props - Hook configuration
 * @returns {UseUpdateGuarantorFormReturn} Form state and handlers
 */
export function useUpdateGuarantorForm({
  initialData,
  loanApplicationId,
}: UseUpdateGuarantorFormProps): UseUpdateGuarantorFormReturn {
  const ability = useAbility();
  const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);

  // Set up default values
  const defaultValues = useMemo(
    () => ({
      ...initialData,
      loanApplicationId: initialData?.loanApplicationId || loanApplicationId,
    }),
    [initialData, loanApplicationId],
  );

  // Create form instance
  const form = useForm<UpdateGuarantorInput>({
    resolver: zodResolver(updateGuarantorSchema),
    defaultValues: defaultValues,
  });

  /**
   * Handles form submission errors
   *
   * @param {any} error - The error response from server action
   */
  const handleSubmitError = (error: any) => {
    handleFormErrors<UpdateGuarantorInput>(error, form.setError);
  };

  return {
    form,
    visibility,
    defaultValues,
    handleSubmitError,
  };
}
