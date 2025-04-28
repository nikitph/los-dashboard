"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "@/hooks/use-toast";
import {
  PersonalInformationFormValues,
  PersonalInformationSchema,
} from "@/app/[locale]/saas/(private)/personal/schema";
import { updateApplicant } from "@/app/[locale]/saas/(private)/personal/actions";
import { useDocuments } from "@/hooks/useDocuments";
import { useUser } from "@/contexts/userContext";

interface UsePersonalInformationFormProps {
  initialData?: Partial<PersonalInformationFormValues>;
  loanApplicationId: string;
  applicantId: string;
}

export function usePersonalInformationForm({
  initialData,
  loanApplicationId,
  applicantId,
}: UsePersonalInformationFormProps) {
  const router = useRouter();
  const user = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadharOtp, setAadharOtp] = useState("");
  const [panOtp, setPanOtp] = useState("");
  const { fetchDocuments } = useDocuments();

  // Initialize form with react-hook-form
  const form = useForm<PersonalInformationFormValues>({
    resolver: zodResolver(PersonalInformationSchema),
    defaultValues: {
      id: applicantId,
      userId: user.user?.id,
      bankId: user.user?.currentRole?.bankId || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : new Date(),
      addressState: initialData?.addressState || "Madhya Pradesh",
      addressCity: initialData?.addressCity || "",
      addressFull: initialData?.addressFull || "",
      addressPinCode: initialData?.addressPinCode || "",
      aadharNumber: initialData?.aadharNumber || "",
      panNumber: initialData?.panNumber || "",
      aadharVerificationStatus: initialData?.aadharVerificationStatus || false,
      panVerificationStatus: initialData?.panVerificationStatus || false,
      photoUrl: initialData?.photoUrl || null,
    },
    mode: "onBlur",
  });

  // Fetch documents on mount
  useMemo(() => {
    fetchDocuments("applicant", applicantId).then((docs) => console.log("docs", docs));
  }, [applicantId, fetchDocuments]);

  // Get translations
  const t = useTranslations("Applicant");

  // Handle form submission
  const onSubmit = async (data: PersonalInformationFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await updateApplicant(applicantId, data);

      if (response.success) {
        toast({
          title: t("toast.personalInfoAdded"),
          description: t(response.message),
        });

        router.push(`/saas/photocapture?aid=${applicantId}&lid=${loanApplicationId}`);
        router.refresh();
      } else {
        toast({
          title: t("toast.error"),
          //@ts-ignore
          description: response?.errors?.[0] ? t(response?.errors?.[0]) : t("errors.operationFailed"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: t("toast.error"),
        description: t("errors.unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Document verification logic
  const verifyDocument = (documentType: "aadhar" | "pan") => {
    setTimeout(() => {
      if (documentType === "aadhar") {
        form.setValue("aadharVerificationStatus", true);
        toast({
          title: t("toast.verificationSuccessful"),
          description: t("toast.aadharVerified"),
        });
      } else {
        form.setValue("panVerificationStatus", true);
        toast({
          title: t("toast.verificationSuccessful"),
          description: t("toast.panVerified"),
        });
      }
    }, 1500);
  };

  return {
    form,
    isSubmitting,
    aadharOtp,
    setAadharOtp,
    panOtp,
    setPanOtp,
    verifyDocument,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
