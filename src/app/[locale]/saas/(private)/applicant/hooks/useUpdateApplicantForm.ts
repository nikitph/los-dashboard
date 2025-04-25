import { useToast } from "@/hooks/use-toast";
import { useAbility } from "@/lib/casl/abilityContext";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { updateApplicant } from "../actions/updateApplicant";
import { defineApplicantFieldVisibility } from "../lib/defineApplicantFieldVisibility";
import { ApplicantView, UpdateApplicantInput, updateApplicantSchema } from "../schemas/applicantSchema";

/**
 * Custom hook for managing the update applicant form
 *
 * @param initialData - Initial data for the applicant being edited
 * @returns Form state, submission handler, and field visibility
 */
export function useUpdateApplicantForm(initialData: ApplicantView | null) {
  const t = useTranslations("Applicant");
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user ability and calculate field visibility
  const ability = useAbility();
  const visibility = useMemo(() => defineApplicantFieldVisibility(ability), [ability]);

  // Initialize form with Zod resolver
  const form = useForm<UpdateApplicantInput>({
    resolver: zodResolver(updateApplicantSchema),
    defaultValues: {
      id: initialData?.id || "",
      userId: initialData?.userId || "",
      bankId: initialData?.bankId || "",
      dateOfBirth: initialData?.dateOfBirth || null,
      addressState: initialData?.addressState || null,
      addressCity: initialData?.addressCity || null,
      addressFull: initialData?.addressFull || null,
      addressPinCode: initialData?.addressPinCode || null,
      aadharNumber: initialData?.aadharNumber || null,
      panNumber: initialData?.panNumber || null,
      aadharVerificationStatus: initialData?.aadharVerificationStatus || false,
      panVerificationStatus: initialData?.panVerificationStatus || false,
      photoUrl: initialData?.photoUrl || null,
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      // Reset form with new values
      form.reset({
        id: initialData.id,
        userId: initialData.userId,
        bankId: initialData.bankId,
        dateOfBirth: initialData.dateOfBirth,
        addressState: initialData.addressState,
        addressCity: initialData.addressCity,
        addressFull: initialData.addressFull,
        addressPinCode: initialData.addressPinCode,
        aadharNumber: initialData.aadharNumber,
        panNumber: initialData.panNumber,
        aadharVerificationStatus: initialData.aadharVerificationStatus,
        panVerificationStatus: initialData.panVerificationStatus,
        photoUrl: initialData.photoUrl,
      });
    }
  }, [initialData, form]);

  /**
   * Handles form submission, calls the update applicant action
   *
   * @param data - Validated form data
   */
  const onSubmit = async (data: UpdateApplicantInput) => {
    setIsSubmitting(true);

    try {
      const response = await updateApplicant(data);

      if (response.success) {
        toast({
          title: t("toast.updateSuccess"),
          description: t("toast.updateSuccessDescription"),
        });

        // Navigate to the view page after successful update
        router.push(`/applicant/${data.id}/view`);
      } else {
        // Handle validation and other errors
        handleFormErrors(response, form.setError);
      }
    } catch (error) {
      console.error("Error updating applicant:", error);
      toast({
        title: t("toast.updateError"),
        description: t("toast.updateErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    visibility,
    isSubmitting,
    isEditMode: !!initialData,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
