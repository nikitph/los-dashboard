"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { createApplicant, updateApplicant } from "@/app/[locale]/saas/(private)/applicants/actions";
import { z } from "zod";
import { indianStates } from "@/lib/utils";
import { ApplicantSchema } from "@/schemas/zodSchemas";

type ApplicantFormValues = z.infer<typeof ApplicantSchema>;

interface ApplicantFormProps {
  initialData?: Partial<ApplicantFormValues> & { id?: string };
  userId?: string;
  isEditMode?: boolean;
}

export default function ApplicantForm({ initialData, userId, isEditMode = false }: ApplicantFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadharOtp, setAadharOtp] = useState("");
  const [panOtp, setPanOtp] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ApplicantFormValues>({
    resolver: zodResolver(ApplicantSchema),
    defaultValues: {
      userId: userId || initialData?.userId || "placeholder", // Use a placeholder value to prevent validation error
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : new Date(),
      addressState: initialData?.addressState || "Madhya Pradesh",
      addressCity: initialData?.addressCity || "",
      addressFull: initialData?.addressFull || "",
      addressPinCode: initialData?.addressPinCode || "",
      aadharNumber: initialData?.aadharNumber || "",
      panNumber: initialData?.panNumber || "",
      aadharVerificationStatus: initialData?.aadharVerificationStatus || false,
      panVerificationStatus: initialData?.panVerificationStatus || false,
      photoUrl: initialData?.photoUrl || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      // Reset form with initial data
      Object.keys(initialData).forEach((key) => {
        const typedKey = key as keyof ApplicantFormValues;
        if (typedKey === "dateOfBirth" && initialData[typedKey]) {
          setValue(typedKey, new Date(initialData[typedKey] as string | Date));
        } else if (initialData[typedKey] !== undefined) {
          setValue(typedKey as any, initialData[typedKey] as any);
        }
      });
    }

    // Update userId when it changes from props
    if (userId) {
      setValue("userId", userId);
    }
  }, [initialData, userId, setValue]);

  const onSubmit = async (data: ApplicantFormValues) => {
    setIsSubmitting(true);
    try {
      // Check if we have a valid userId before submission
      if (!isEditMode && (data.userId === "" || data.userId === "placeholder")) {
        // If userId not loaded yet, show error
        toast({
          title: "Error",
          description: "User ID not available. Please wait for user data to load or try refreshing the page.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Log form data to debug
      console.log("Form data being submitted:", data);

      let response;

      if (isEditMode && initialData?.id) {
        // Make sure all fields are explicitly set for the update action
        const updateData = {
          userId: data.userId,
          dateOfBirth: data.dateOfBirth,
          addressState: data.addressState,
          addressCity: data.addressCity,
          addressFull: data.addressFull,
          addressPinCode: data.addressPinCode,
          aadharNumber: data.aadharNumber,
          panNumber: data.panNumber,
          aadharVerificationStatus: data.aadharVerificationStatus,
          panVerificationStatus: data.panVerificationStatus,
          photoUrl: data.photoUrl || "",
        };

        console.log("Sending update with ID:", initialData.id);
        console.log("Update data:", updateData);

        response = await updateApplicant(initialData.id, updateData);
      } else {
        response = await createApplicant(data);
      }

      console.log("Server response:", response);

      if (response.success) {
        toast({
          title: isEditMode ? "Applicant Updated" : "Applicant Created",
          description: response.message,
        });

        router.push("/saas/applicants/list");
        router.refresh();
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

  const verifyDocument = (documentType: "aadhar" | "pan") => {
    // Simulate verification process
    setTimeout(() => {
      if (documentType === "aadhar") {
        setValue("aadharVerificationStatus", true);
        toast({
          title: "Verification Successful",
          description: "Aadhar has been verified successfully",
        });
      } else {
        setValue("panVerificationStatus", true);
        toast({
          title: "Verification Successful",
          description: "PAN has been verified successfully",
        });
      }
    }, 1500);
  };

  return (
    <div className="flex h-full bg-gray-100">
      <div className="flex-1 p-8">
        <h2 className="mb-4 text-2xl font-semibold">{isEditMode ? "Edit Application" : "New Application"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Loan Type field - for consistency with the example */}
          <div>
            <Label htmlFor="loanType" className="block text-sm font-medium text-gray-700">
              Type Of Loan
            </Label>
            <Select defaultValue="PERSONAL">
              <SelectTrigger className="mt-1 max-w-[200px] bg-white">
                <SelectContent>
                  <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                  <SelectItem value="VEHICLE">Vehicle Loan</SelectItem>
                  <SelectItem value="HOUSE_CONSTRUCTION">House Construction Loan</SelectItem>
                  <SelectItem value="PLOT_PURCHASE">Plot Purchase Loan</SelectItem>
                  <SelectItem value="MORTGAGE">Mortgage Loan</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>

          {/* Upload Documents */}
          <div>
            <Label className="block text-sm font-medium text-gray-700">Upload Documents</Label>
            <div className="mt-2 space-y-4">
              {/* Aadhar */}
              <div>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter 12 Digit Aadhar Number"
                    className="max-w-[200px] bg-white"
                    {...register("aadharNumber")}
                  />
                  <Button variant="outline" className="max-w-[200px]">
                    Upload
                  </Button>
                  <Input
                    type="text"
                    placeholder="OTP"
                    className="w-24 max-w-[200px] bg-white"
                    value={aadharOtp}
                    onChange={(e) => setAadharOtp(e.target.value)}
                  />
                  <Button
                    variant="default"
                    className="max-w-[200px]"
                    type="button"
                    onClick={() => verifyDocument("aadhar")}
                  >
                    Verify
                  </Button>
                </div>
                {errors.aadharNumber && <p className="mt-1 text-sm text-red-600">{errors.aadharNumber.message}</p>}
                <p className="mt-1 text-sm text-gray-500">Less than 5 MB</p>
              </div>

              {/* PAN */}
              <div>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter 10 Digit PAN"
                    className="max-w-[200px] bg-white"
                    {...register("panNumber")}
                  />
                  <Button variant="outline" className="max-w-[200px]">
                    Upload
                  </Button>
                  <Input
                    type="text"
                    placeholder="OTP"
                    className="w-24 max-w-[200px] bg-white"
                    value={panOtp}
                    onChange={(e) => setPanOtp(e.target.value)}
                  />
                  <Button
                    variant="default"
                    className="max-w-[200px]"
                    type="button"
                    onClick={() => verifyDocument("pan")}
                  >
                    Verify
                  </Button>
                </div>
                {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>}
                <p className="mt-1 text-sm text-gray-500">Less than 5 MB</p>
              </div>
            </div>
          </div>

          {/* Name Fields - these fields are in the UI example but not in schema,
              so we'll include them for visual consistency but not tie them to form state */}
          <div className="grid max-w-[450px] grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </Label>
              <Input type="text" id="firstName" className="mt-1 max-w-[200px] bg-white" />
            </div>
            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </Label>
              <Input type="text" id="lastName" className="mt-1 max-w-[200px] bg-white" />
            </div>
          </div>

          {/* Hidden User ID field */}
          <input type="hidden" {...register("userId")} />

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </Label>
            <div className="mt-1 flex space-x-2">
              <Input
                type="date"
                id="dateOfBirth"
                className="max-w-[200px] bg-white"
                {...register("dateOfBirth", { valueAsDate: true })}
              />
            </div>
            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
          </div>

          {/* Permanent Address */}
          <div>
            <Label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700">
              Permanent Address
            </Label>
            <div className="mt-1 grid max-w-[640px] grid-cols-3 gap-0">
              {/* States Dropdown */}
              <Select
                onValueChange={(value) => setValue("addressState", value)}
                value={watch("addressState")}
                defaultValue="Madhya Pradesh"
              >
                <SelectTrigger className="max-w-[200px] bg-white">
                  <SelectValue placeholder={"State"}>{watch("addressState")}</SelectValue>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectTrigger>
              </Select>
              <Input type="text" placeholder="City" className="max-w-[200px] bg-white" {...register("addressCity")} />
              <Input
                type="text"
                placeholder="Pin Code"
                className="max-w-[200px] bg-white"
                {...register("addressPinCode")}
              />
            </div>
            {errors.addressState && <p className="mt-1 text-sm text-red-600">{errors.addressState.message}</p>}
            {errors.addressCity && <p className="mt-1 text-sm text-red-600">{errors.addressCity.message}</p>}
            {errors.addressPinCode && <p className="mt-1 text-sm text-red-600">{errors.addressPinCode.message}</p>}
            <div className="mt-2">
              <Input
                type="text"
                placeholder="Full Address 1"
                className="w-full max-w-[628px] bg-white"
                {...register("addressFull")}
              />
              {errors.addressFull && <p className="mt-1 text-sm text-red-600">{errors.addressFull.message}</p>}
            </div>
          </div>

          {/* Photo URL - Hidden field as it's likely managed elsewhere in a real app */}
          <input type="hidden" {...register("photoUrl")} />
          <input type="hidden" {...register("aadharVerificationStatus")} />
          <input type="hidden" {...register("panVerificationStatus")} />

          {/* Submit Button */}
          <div className="justify-left flex">
            <Button type="submit" className="max-w-[200px] px-6 py-3" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : isEditMode ? "Update Applicant" : "Submit Application"}
            </Button>
          </div>

          {!(watch("aadharVerificationStatus") && watch("panVerificationStatus")) && (
            <p className="text-left text-sm text-gray-500">Please Validate Aadhar and PAN card</p>
          )}

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
}
