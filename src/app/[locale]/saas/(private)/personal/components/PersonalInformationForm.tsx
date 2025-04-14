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
import { indianStates } from "@/lib/utils";
import {
  PersonalInformationFormProps,
  PersonalInformationFormValues,
  PersonalInformationSchema,
} from "@/app/[locale]/saas/(private)/personal/schema";
import { updateApplicant } from "@/app/[locale]/saas/(private)/personal/actions";
import { useDocuments } from "@/hooks/useDocuments";
import FileUploadButton from "@/components/FileUploadButton";
import { useUser } from "@/contexts/userContext";

export default function PersonalInformationForm({ initialData, loanApplication }: PersonalInformationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadharOtp, setAadharOtp] = useState("");
  const { user } = useUser();
  const [panOtp, setPanOtp] = useState("");
  const { fetchDocuments } = useDocuments();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<PersonalInformationFormValues>({
    resolver: zodResolver(PersonalInformationSchema),
    defaultValues: {
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : new Date(),
      addressState: initialData?.addressState || "Madhya Pradesh",
      addressCity: initialData?.addressCity || "",
      addressFull: initialData?.addressFull || "",
      addressPinCode: initialData?.addressPinCode || "",
      aadharNumber: initialData?.aadharNumber || "",
      panNumber: initialData?.panNumber || "",
      aadharVerificationStatus: initialData?.aadharVerificationStatus || false,
      panVerificationStatus: initialData?.panVerificationStatus || false,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: PersonalInformationFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await updateApplicant(loanApplication.applicant.id, data);

      if (response.success) {
        toast({
          title: "Personal Information Added",
          description: response.message,
        });

        router.push(`/saas/photocapture?aid=${loanApplication.applicant.id}&lid=${loanApplication.id}`);
        router.refresh();
      } else {
        toast({
          title: "Error",
          //@ts-ignore
          description: response?.errors[0] || "Operation failed",
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

  useEffect(() => {
    const docs = fetchDocuments("applicant", loanApplication.applicant.id).then((docs) => console.log("docs", docs));
  }, []);

  const verifyDocument = (documentType: "aadhar" | "pan") => {
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Date of Birth */}
          <div>
            <Label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </Label>
            <div className="mt-1 flex w-[150px] space-x-2">
              <Input
                type="date"
                id="dateOfBirth"
                className="max-w-[200px] bg-white"
                {...register("dateOfBirth", { valueAsDate: true })}
              />
            </div>
            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
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
                  <FileUploadButton
                    documentType="AADHAAR_CARD"
                    entityType="applicant"
                    entityId={loanApplication.applicant.id}
                    //@ts-ignore
                    uploadedById={user?.id}
                    description="Applicant's identification document"
                    onUploadSuccess={(docId) => console.log(`Document uploaded with ID: ${docId}`)}
                    title={"Aadhar Card"}
                  />
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
                  {errors.aadharVerificationStatus && (
                    <p className="mt-1 text-sm text-red-600">{errors.aadharVerificationStatus.message}</p>
                  )}
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
                  <FileUploadButton
                    documentType="PAN_CARD"
                    entityType="applicant"
                    entityId={loanApplication.applicant.id}
                    //@ts-ignore
                    uploadedById={user?.id}
                    description="Applicant's identification document"
                    onUploadSuccess={(docId) => console.log(`Document uploaded with ID: ${docId}`)}
                    title={"PAN Card"}
                  />
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
                  {errors.panVerificationStatus && (
                    <p className="mt-1 text-sm text-red-600">{errors.panVerificationStatus.message}</p>
                  )}
                </div>
                {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>}
                <p className="mt-1 text-sm text-gray-500">Less than 5 MB</p>
              </div>
            </div>
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

          <input type="hidden" defaultValue={"false"} {...register("aadharVerificationStatus")} />
          <input type="hidden" defaultValue={"false"} {...register("panVerificationStatus")} />

          {/* Submit Button */}
          <div className="justify-left flex">
            <Button type="submit" className="max-w-[200px] px-6 py-3" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Submit Information"}
            </Button>
          </div>

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
