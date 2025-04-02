"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSignupSchema, SignupSchemaType } from "@/app/[locale]/saas/(auth)/banksignup/schema";
import { updateBankOnboardingStatus } from "@/app/[locale]/saas/(auth)/banksignup/actions";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { useTranslations } from "next-intl";

export function BankSignupForm({ className, signup, bankId, setCurrentStep, ...props }: any) {
  const t = useTranslations(BankSignupForm.name);
  const v = useTranslations("validation");
  const signupSchema = createSignupSchema(v);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (clientData: SignupSchemaType) => {
    const response = await signup(clientData, bankId);
    if (!response.success) {
      handleFormErrors(response, setError);
      return;
    }

    await updateBankOnboardingStatus(bankId, "ADMIN_CREATED");
    setCurrentStep(2);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("firstName.label")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("firstName.placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("lastName.label")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("lastName.placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email.label")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("email.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phone.label")}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t("phone.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("password.label")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t("password.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirmPassword.label")}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t("confirmPassword.placeholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("submit.loading") : t("submit.label")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
