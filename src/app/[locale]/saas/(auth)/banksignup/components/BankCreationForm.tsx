"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createBank } from "../actions";
import { cn } from "@/lib/utils";
import { BankCreationFormProps, BankFormValues, createBankSchema } from "@/app/[locale]/saas/(auth)/banksignup/schema";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { toastError, toastSuccess } from "@/lib/toastUtils";
import { useTranslations } from "next-intl";

export function BankCreationForm({ className, setCurrentStep, setBank, ...props }: BankCreationFormProps) {
  const t = useTranslations(BankCreationForm.name);
  const v = useTranslations("validation");
  const bankCreationSchema = createBankSchema(v);

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankCreationSchema),
    defaultValues: {
      name: "",
      officialEmail: "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: BankFormValues) => {
    try {
      const response = await createBank(data);

      if (!response.success) {
        handleFormErrors(response, setError);
        return;
      }
      setBank(response.data);
      toastSuccess({
        title: t("toast.successTitle"),
        description: t("toast.successDescription"),
      });
      setCurrentStep(1);
    } catch (error) {
      toastError({
        title: t("toast.errorTitle"),
        description: t("toast.errorDescription"),
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("welcomeTitle")}</CardTitle>
          <CardDescription>{t("welcomeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("bankNameLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("bankNamePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="officialEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("emailLabel")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("emailPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("creatingButton") : t("createButton")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
