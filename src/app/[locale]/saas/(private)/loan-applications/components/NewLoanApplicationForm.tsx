"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createInitialLoanApplication } from "../actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUser } from "@/contexts/userContext";
import { createLoanSchema, LoanFormData } from "@/app/[locale]/saas/(private)/loan-applications/schema";
import { useFormTranslation } from "@/hooks/useFormTranslation";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { toastError } from "@/lib/toastUtils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function NewLoanApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const { page, validation, errors, toast: toastT, buttons, locale } = useFormTranslation("LoanForm");
  const loanSchema = createLoanSchema(validation);

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      loanType: undefined,
      requestedAmount: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      // @ts-ignore
      bankId: currentUser?.currentRole.bankId,
    },
  });

  const {
    setError,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const handleSendLink = () => {
    toast({
      title: "Info",
      description: buttons("sendLink"),
      variant: "default",
    });
  };

  const onSubmit = async (data: LoanFormData) => {
    console.log("submit", data);
    try {
      const response = await createInitialLoanApplication({
        ...data,
      });

      if (!response.success) {
        handleFormErrors(response, setError);
        return;
      }

      toast({
        title: toastT("successTitle"),
        description: response.message,
        variant: "default",
      });

      router.push(`/${locale}/saas/personal?lid=${response.data.id}`);
    } catch (error) {
      toastError({
        title: toastT("errorTitle"),
        description: toastT("errorDescription"),
      });
    }
  };

  return (
    <div className="bg-default-background w-full px-6 py-12">
      <div className="mx-auto flex max-w-[600px] flex-col gap-12">
        {/* Heading */}
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold">{page("title")}</span>
          <span className="text-sm text-gray-500">{page("description")}</span>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              {/* Loan Type */}
              <FormField
                control={form.control}
                name="loanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{page("loanTypeLabel")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={page("loanTypePlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERSONAL">Personal</SelectItem>
                        <SelectItem value="VEHICLE">Vehicle</SelectItem>
                        <SelectItem value="HOUSE_CONSTRUCTION">House Construction</SelectItem>
                        <SelectItem value="PLOT_AND_HOUSE_CONSTRUCTION">Plot and House Construction</SelectItem>
                        <SelectItem value="PLOT_PURCHASE">Plot Purchase</SelectItem>
                        <SelectItem value="MORTGAGE">Mortgage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Requested Amount */}
              <FormField
                control={form.control}
                name="requestedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{page("requestedAmountLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={page("requestedAmountPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First & Last Name */}
              <div className="flex w-full items-start gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{page("firstNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={page("firstNamePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{page("lastNameLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={page("lastNamePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{page("phoneNumberLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={page("phoneNumberPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{page("emailLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={page("emailPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="mt-6 flex w-full items-center gap-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={handleSendLink}>
                  {buttons("sendLink")}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1" onClick={handleSubmit(onSubmit)}>
                  {isSubmitting ? buttons("submitting") : buttons("submit")}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
