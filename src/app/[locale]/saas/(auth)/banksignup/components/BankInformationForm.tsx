"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { getBankById, updateBank, updateBankOnboardingStatus } from "../actions";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { BankInfoData, createBankInfoSchema } from "@/app/[locale]/saas/(auth)/banksignup/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface BankInformationFormProps extends React.HTMLAttributes<HTMLDivElement> {
  bankId: string;
  setCurrentStep: (step: number) => void;
}

export function BankInformationForm({ className, bankId, setCurrentStep, ...props }: BankInformationFormProps) {
  const locale = useLocale();
  const t = useTranslations(BankInformationForm.name);
  const v = useTranslations("validation");
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
          toast({
            title: "Error",
            description: "Failed to fetch bank details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (bankId) {
      fetchBankData();
    }
  }, [bankId, setValue]);

  const onSubmit = async (data: BankInfoData) => {
    try {
      // Convert regulatoryLicenses string to JSON if provided
      let processedData = { ...data };
      const response = await updateBank(bankId, processedData, locale);

      if (response.success) {
        setSuccess(true);
        toast({
          title: "Success",
          description: "Bank details updated successfully",
        });
        await updateBankOnboardingStatus(bankId, "BANK_DETAILS_ADDED");
        setCurrentStep(3);

        // Optionally redirect after successful update
        // router.push("/saas/banks/list");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update bank details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating bank:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
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
          <CardTitle className="text-xl">{bankName} - Additional Bank Info</CardTitle>
          <CardDescription>Provide the following info as per bank incorporation documents</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>Bank details updated successfully!</AlertDescription>
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
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact Number" {...field} />
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
                        <FormLabel>Legal Entity Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Legal Entity Name" {...field} />
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
                      <FormLabel>Address Line</FormLabel>
                      <FormControl>
                        <Input placeholder="Address Line" {...field} />
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
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
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
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
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
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Zip Code" {...field} />
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
                        <FormLabel>GST Number</FormLabel>
                        <FormControl>
                          <Input placeholder="GST Number" {...field} />
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
                        <FormLabel>PAN Number</FormLabel>
                        <FormControl>
                          <Input placeholder="PAN Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button" onClick={() => router.push("/saas/banks/list")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Bank Profile"}
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
