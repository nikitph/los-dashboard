import { useUser } from "@/contexts/userContext";
import { useFormTranslation } from "@/hooks/useFormTranslation";
import { useAbility } from "@/lib/casl/abilityContext";
import { toastError, toastSuccess } from "@/lib/toastUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { submitPendingUserRequest } from "../actions";
import { defineUserFieldVisibility } from "../lib/defineUserFieldVisibility";
import { CreateUserInput, createUserSchema, UserRecord } from "../schemas/userSchema";

/**
 * Props for the useUserForm hook
 */
export interface UseUserFormProps {
  /** Initial user data for edit mode */
  initialData?: UserRecord;
  /** Bank ID to associate the user with */
  bankId: string;
}

/**
 * Custom hook for managing user form state and submission
 *
 * @param {UseUserFormProps} options - Hook options
 * @returns Form state, handlers, and UI state
 */
export function useUserForm({ initialData, bankId }: UseUserFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const ability = useAbility();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get translations
  const { page, validation, buttons, errors, toast: toastMessages, locale } = useFormTranslation("UserCreateForm");

  // Get field visibility based on user permissions
  const visibility = useMemo(() => defineUserFieldVisibility(ability), [ability]);

  // Determine if we're in edit mode
  const isEditMode = !!initialData?.id;

  // Set up default values
  const defaultValues: Partial<CreateUserInput> = useMemo(() => {
    return {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phoneNumber: initialData?.phoneNumber || "",
      role: (initialData?.role as any) || "",
      bankId: bankId || "",
    };
  }, [initialData, bankId]);

  // Initialize the form
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
    mode: "onChange",
  });

  // Update bankId when it changes
  useEffect(() => {
    if (bankId) form.setValue("bankId", bankId);
  }, [bankId, form]);

  // Form submission handler
  const onSubmit = useCallback(
    async (values: CreateUserInput) => {
      if (!user) return;

      setIsSubmitting(true);

      try {
        startTransition(async () => {
          const res = await submitPendingUserRequest(values, user.id, locale);

          if (res.success) {
            toastSuccess({
              title: toastMessages("success"),
              description: toastMessages("userRequestSubmitted"),
            });
            router.push(`/${locale}/saas/users/list`);
          } else {
            const errorMessage = res.errors?.root || toastMessages("errorSubmitting");
            toastError({
              title: toastMessages("error"),
              description: errorMessage,
            });

            // Set form errors if they exist in the response
            if (res.errors) {
              Object.entries(res.errors).forEach(([field, message]) => {
                if (field !== "root") {
                  form.setError(field as any, { message });
                }
              });
            }
          }

          setIsSubmitting(false);
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        toastError({
          title: toastMessages("error"),
          description: toastMessages("unexpectedError"),
        });
        setIsSubmitting(false);
      }
    },
    [user, locale, router, form, toastMessages],
  );

  return {
    form,
    visibility,
    isEditMode,
    defaultValues,
    isSubmitting,
    onSubmit,
    translations: {
      page,
      buttons,
      errors,
    },
  };
}

/**
 * Type definition for the return value of useUserForm
 */
export type UseUserFormReturn = ReturnType<typeof useUserForm>;
