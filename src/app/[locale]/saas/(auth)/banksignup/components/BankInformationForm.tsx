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
import { BankInfoData, createBankInfoSchema } from "@/app/[locale]/saas/(auth)/banksignup/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toastError, toastSuccess } from "@/lib/toastUtils";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { useFormTranslation } from "@/hooks/useFormTranslation";

interface BankInformationFormProps extends React.HTMLAttributes<HTMLDivElement> {
  bankId: string;
  setCurrentStep: (step: number) => void;
}

export function BankInformationForm({ className, bankId, setCurrentStep, ...props }: BankInformationFormProps) {
  const { page, validation, errors, toast, buttons, locale } = useFormTranslation("BankInformationForm");

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [bankName, setBankName] = useState("");

  const form = useForm<BankInfoData>({
    resolver: zodResolver(createBankInfoSchema(validation)),
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

          setValue("contactNumber", bankData.contactNumber || "");
          setValue("addressLine", bankData.addressLine || "");
          setValue("city", bankData.city || "");
          setValue("state", bankData.state || "");
          setValue("zipCode", bankData.zipCode || "");
          setValue("legalEntityName", bankData.legalEntityName || "");
          setValue("gstNumber", bankData.gstNumber || "");
          setValue("panNumber", bankData.panNumber || "");
        } else {
          toastError({ title: toast("errorTitle"), description: errors("fetchFailed") });
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
        toastError({ title: toast("errorTitle"), description: errors("unexpected") });
      }
    };

    if (bankId) fetchBankData();
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
        title: toast("successTitle"),
        description: toast("successDescription"),
      });

      setCurrentStep(3);
    } catch (error) {
      toastError({
        title: toast("errorTitle"),
        description: toast("errorDescription"),
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
          <CardTitle className="text-xl">
            {bankName} - {page("title")}
          </CardTitle>
          <CardDescription>{page("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{page("successAlert")}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                {/* Contact & Legal Entity */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{page("contactNumber.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={page("contactNumber.placeholder")} {...field} />
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
                        <FormLabel>{page("legalEntityName.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={page("legalEntityName.placeholder")} {...field} />
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
                      <FormLabel>{page("addressLine.label")}</FormLabel>
                      <FormControl>
                        <Input placeholder={page("addressLine.placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City, State, Zip */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{page("city.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={page("city.placeholder")} {...field} />
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
                        <FormLabel>{page("state.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={page("state.placeholder")} {...field} />
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
                        <FormLabel>{page("zipCode.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={page("zipCode.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* GST and PAN */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="gstNumber"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>{page("gstNumber.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={page("gstNumber.placeholder")} {...field} />
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
                        <FormLabel>{page("panNumber.label")}</FormLabel>
                        <FormControl>
                          <Input placeholder={page("panNumber.placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button" onClick={() => router.push("/saas/banks/list")}>
                    {buttons("cancel")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? buttons("updating") : buttons("update")}
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
