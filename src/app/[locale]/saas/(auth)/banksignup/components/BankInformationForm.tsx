"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getBankById, updateBank, updateBankOnboardingStatus } from "../actions";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { BankInfoData, createBankInfoSchema } from "@/app/[locale]/saas/(auth)/banksignup/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toastError, toastSuccess } from "@/lib/toastUtils";
import { handleFormErrors } from "@/lib/formErrorHelper";

interface BankInformationFormProps extends React.HTMLAttributes<HTMLDivElement> {
  bankId: string;
  setCurrentStep: (step: number) => void;
}

export function BankInformationForm({ className, bankId, setCurrentStep, ...props }: BankInformationFormProps) {
  const locale = useLocale();
  const t = useTranslations("BankInformationForm.page");
  const v = useTranslations("BankInformationForm.validation");
  const e = useTranslations("BankInformationForm.errors");
  const toast = useTranslations("BankInformationForm.toast");
  const btn = useTranslations("BankInformationForm.buttons");
  const bankInformationSchema = createBankInfoSchema(v);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [bankName, setBankName] = useState("");

  const form = useForm<BankInfoData>({
    resolver: zodResolver(bankInformationSchema),
    defaultValues: {
      contactNumber: "",
      addressLine: "",
      city: "",
      state: "",
      zipCode: "",
      legalEntityName: "",
      gstNumber: "",
      panNumber: "",
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const response = await getBankById(bankId);
        if (response.success && response.data) {
          setIsLoading(false);
          const bankData = response.data;
          setBankName(bankData.name);

          // Set form values for each field if they exist
          setValue("contactNumber", bankData.contactNumber || "");
          setValue("addressLine", bankData.addressLine || "");
          setValue("city", bankData.city || "");
          setValue("state", bankData.state || "");
          setValue("zipCode", bankData.zipCode || "");
          setValue("legalEntityName", bankData.legalEntityName || "");
          setValue("gstNumber", bankData.gstNumber || "");
          setValue("panNumber", bankData.panNumber || "");
        } else {
          toastError({
            title: toast("errorTitle"),
            description: e("fetchFailed"),
          });
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
        toastError({
          title: toast("errorTitle"),
          description: e("unexpected"),
        });
      }
    };

    if (bankId) {
      fetchBankData();
    }
  }, [bankId]);

  const onSubmit = async (data: BankInfoData) => {
    try {
      const response = await updateBank(bankId, data, locale);

      if (!response.success) {
        handleFormErrors(response, setError);
        return;
      }

      setSuccess(true);
      await updateBankOnboardingStatus(bankId, "BANK_DETAILS_ADDED");

      toastSuccess({
        title: t("toast.successTitle"),
        description: t("toast.successDescription"),
      });

      setCurrentStep(3);
    } catch (error) {
      toastError({
        title: t("toast.errorTitle"),
        description: t("toast.errorDescription"),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p>Loading bank details...</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title", { bankName })}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{t("successAlert")}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                {/* Contact & Legal Entity (Row 1) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{t("contactNumber.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("contactNumber.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="legalEntityName"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{t("legalEntityName.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("legalEntityName.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Line */}
                <FormField
                  control={control}
                  name="addressLine"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>{t("addressLine.label")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("addressLine.placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City, State, Zip (Row 3) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{t("city.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("city.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="state"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{t("state.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("state.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{t("zipCode.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("zipCode.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* GST and PAN (Row 4) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="gstNumber"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{t("gstNumber.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("gstNumber.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="panNumber"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{t("panNumber.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("panNumber.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button" onClick={() => router.push("/saas/banks/list")}>
                    {btn("cancel")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? btn("updating") : btn("update")}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
