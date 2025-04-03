"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { getBankById, updateBank, updateBankOnboardingStatus } from "../actions";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { BankInfoData, createBankInfoSchema } from "@/app/[locale]/saas/(auth)/banksignup/schema";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [bankName, setBankName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BankInfoData>({
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

  // Fetch existing bank data
  useEffect(() => {
    const fetchBankData = async () => {
      setIsLoading(true);
      try {
        const response = await getBankById(bankId);
        console.log("Fetched bank data:", response);
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
    setIsSubmitting(true);
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
      setIsSubmitting(false);
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              {/* Contact & Legal Entity (Row 1) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input id="contactNumber" placeholder="Contact Number" {...register("contactNumber")} />
                  {errors.contactNumber && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.contactNumber.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="legalEntityName">Legal Entity Name</Label>
                  <Input id="legalEntityName" placeholder="Legal Entity Name" {...register("legalEntityName")} />
                  {errors.legalEntityName && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.legalEntityName.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Address Line */}
              <div className="grid gap-2">
                <Label htmlFor="addressLine">Address Line</Label>
                <Input id="addressLine" placeholder="Address Line" {...register("addressLine")} />
                {errors.addressLine && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.addressLine.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* City, State, Zip (Row 3) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" {...register("city")} />
                  {errors.city && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.city.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="State" {...register("state")} />
                  {errors.state && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.state.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" placeholder="Zip Code" {...register("zipCode")} />
                  {errors.zipCode && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.zipCode.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* GST and PAN (Row 4) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input id="gstNumber" placeholder="GST Number" {...register("gstNumber")} />
                  {errors.gstNumber && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.gstNumber.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input id="panNumber" placeholder="PAN Number" {...register("panNumber")} />
                  {errors.panNumber && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.panNumber.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
