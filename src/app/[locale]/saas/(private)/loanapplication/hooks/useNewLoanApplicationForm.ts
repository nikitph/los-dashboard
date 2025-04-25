"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/userContext";
import { createNewLoanApplication } from "@/app/[locale]/saas/(private)/loanapplication/actions/newLoanApplication";
import {
  NewLoanApplicationInput,
  newLoanApplicationSchema,
} from "@/app/[locale]/saas/(private)/loanapplication/schemas/loanApplicationSchema";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { useLocale, useTranslations } from "next-intl";

export function useNewLoanApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("LoanApplication");
  const router = useRouter();
  const { user: currentUser, loading } = useUser();
  const { toast } = useToast();
  const locale = useLocale();

  console.log("currentUser", currentUser);

  const form = useForm<NewLoanApplicationInput>({
    resolver: zodResolver(newLoanApplicationSchema),
    defaultValues: {
      loanType: undefined,
      amountRequested: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      /* @ts-ignore */
      bankId: currentUser?.currentRole?.bankId || "",
    },
  });

  const handleSendLink = () => {
    toast({
      title: "Info",
      description: "Send Link functionality to be implemented",
      variant: "default",
    });
  };

  const onSubmit = async (data: NewLoanApplicationInput) => {
    console.log("Form submitted with data:", data);
    setIsLoading(true);

    console.log("submit data", data);
    try {
      const result = await createNewLoanApplication({
        ...data,
      });

      if (!result.success) {
        handleFormErrors(result, form.setError, t);
        return;
      }
      toast({
        title: "Success",
        description: "Successfully created loan application",
        variant: "default",
      });
      router.push(`/${locale}/saas/personal?lid=${result.data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create loan application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    isLoading,
    onSubmit,
    handleSendLink,
  };
}
