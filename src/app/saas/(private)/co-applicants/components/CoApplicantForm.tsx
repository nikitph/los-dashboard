"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

import { createCoApplicant, getLoanApplications, updateCoApplicant } from "@/app/saas/(private)/co-applicants/actions";
import { indianStates } from "@/lib/utils";
import { CoApplicantSchema as coApplicantSchema } from "@/schemas/zodSchemas";

type CoApplicantFormValues = z.infer<typeof coApplicantSchema>;

interface CoApplicantFormProps {
  initialData?: Partial<CoApplicantFormValues> & { id?: string };
  isEditMode?: boolean;
}

export default function CoApplicantForm({ initialData, isEditMode = false }: CoApplicantFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanApplications, setLoanApplications] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CoApplicantFormValues>({
    resolver: zodResolver(coApplicantSchema),
    defaultValues: {
      loanApplicationId: initialData?.loanApplicationId || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      addressState: initialData?.addressState || "",
      addressCity: initialData?.addressCity || "",
      addressZipCode: initialData?.addressZipCode || "",
      addressLine1: initialData?.addressLine1 || "",
      addressLine2: initialData?.addressLine2 || "",
      mobileNumber: initialData?.mobileNumber || "",
    },
  });

  // Fetch loan applications on component mount
  useEffect(() => {
    const fetchLoanApplications = async () => {
      try {
        const response = await getLoanApplications();
        if (response.success) {
          setLoanApplications(response.data || []);
        } else {
          toast({
            title: "Error",
            description: "Failed to load loan applications",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching loan applications:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    fetchLoanApplications();
  }, []);

  // Set form values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        const typedKey = key as keyof CoApplicantFormValues;
        if (initialData[typedKey] !== undefined) {
          setValue(typedKey, initialData[typedKey] as any);
        }
      });
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: CoApplicantFormValues) => {
    setIsSubmitting(true);
    try {
      let response;

      if (isEditMode && initialData?.id) {
        response = await updateCoApplicant(initialData.id, data);
      } else {
        response = await createCoApplicant(data);
      }

      if (response.success) {
        toast({
          title: isEditMode ? "Co-applicant Updated" : "Co-applicant Created",
          description: response.message,
        });

        router.push("/saas/co-applicants/list");
      } else {
        toast({
          title: "Error",
          description: response.error || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get applicant name from loan application for display
  const getApplicantNameFromLoanApplication = (id: string) => {
    const loanApp = loanApplications.find((app) => app.id === id);
    if (!loanApp || !loanApp.applicant || !loanApp.applicant.user) return "Select Loan Application";

    const { firstName, lastName } = loanApp.applicant.user;
    return `${firstName || ""} ${lastName || ""}'s Application`;
  };

  return (
    <div className="w-full bg-transparent">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold">{isEditMode ? "Edit Co-applicant" : "Add Co-applicant"}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Loan Application Selection */}
          <div className="space-y-2">
            <Label htmlFor="loanApplicationId" className="text-base font-medium">
              Loan Application
            </Label>
            <Select
              onValueChange={(value) => setValue("loanApplicationId", value)}
              value={watch("loanApplicationId")}
              disabled={isEditMode} // Can't change loan application in edit mode
            >
              <SelectTrigger id="loanApplicationId" className="w-full">
                <SelectValue placeholder="Select Loan Application">
                  {watch("loanApplicationId")
                    ? getApplicantNameFromLoanApplication(watch("loanApplicationId"))
                    : "Select Loan Application"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {loanApplications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.applicant?.user?.firstName || ""} {app.applicant?.user?.lastName || ""}&#39;s Application
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.loanApplicationId && (
              <p className="mt-1 text-sm text-red-600">{errors.loanApplicationId.message}</p>
            )}
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="mb-4 text-lg font-medium">Personal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input id="firstName" {...register("firstName")} placeholder="Enter first name" />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input id="lastName" {...register("lastName")} placeholder="Enter last name" />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input id="email" type="email" {...register("email")} placeholder="Enter email address" />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-sm font-medium">
                  Mobile Number
                </Label>
                <Input id="mobileNumber" {...register("mobileNumber")} placeholder="Enter mobile number" />
                {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber.message}</p>}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="mb-4 text-lg font-medium">Address Information</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="addressState" className="text-sm font-medium">
                  State
                </Label>
                <Select onValueChange={(value) => setValue("addressState", value)} value={watch("addressState")}>
                  <SelectTrigger id="addressState">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.addressState && <p className="mt-1 text-sm text-red-600">{errors.addressState.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressCity" className="text-sm font-medium">
                  City
                </Label>
                <Input id="addressCity" {...register("addressCity")} placeholder="Enter city" />
                {errors.addressCity && <p className="mt-1 text-sm text-red-600">{errors.addressCity.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressZipCode" className="text-sm font-medium">
                  Zip Code
                </Label>
                <Input id="addressZipCode" {...register("addressZipCode")} placeholder="Enter zip code" />
                {errors.addressZipCode && <p className="mt-1 text-sm text-red-600">{errors.addressZipCode.message}</p>}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="addressLine1" className="text-sm font-medium">
                Address Line 1
              </Label>
              <Input id="addressLine1" {...register("addressLine1")} placeholder="Enter address line 1" />
              {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="addressLine2" className="text-sm font-medium">
                Address Line 2 (Optional)
              </Label>
              <Input id="addressLine2" {...register("addressLine2")} placeholder="Enter address line 2 (optional)" />
              {errors.addressLine2 && <p className="mt-1 text-sm text-red-600">{errors.addressLine2.message}</p>}
            </div>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/saas/co-applicants/list")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : isEditMode ? "Update Co-applicant" : "Create Co-applicant"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
