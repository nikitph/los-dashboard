"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

import { createVerification, getLoanApplications, getVerificationOfficers, updateVerification } from "../actions";
import { VerificationSchema } from "@/schemas/zodSchemas";
import MultiImageUpload from "@/app/saas/(private)/verifications/components/MultiImageUpload";
import { useUser } from "@/contexts/userContext";

type VerificationFormValues = z.infer<typeof VerificationSchema>;

interface VerificationFormProps {
  initialData?: Partial<VerificationFormValues> & { id?: string };
  isEditMode?: boolean;
}

export default function VerificationForm({ initialData, isEditMode = false }: VerificationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanApplications, setLoanApplications] = useState<any[]>([]);
  const [verificationOfficers, setVerificationOfficers] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>(initialData?.type || "RESIDENCE");
  const { user, loading } = useUser();

  console.log("user", user);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: {
      loanApplicationId: initialData?.loanApplicationId || "",
      type: initialData?.type || "RESIDENCE",
      status: initialData?.status || "PENDING",
      verificationDate: initialData?.verificationDate ? new Date(initialData.verificationDate) : new Date(),
      verificationTime: initialData?.verificationTime || "12:00 PM",
      result: initialData?.result !== undefined ? initialData.result : false,
      remarks: initialData?.remarks || "",
      verifiedById: initialData?.verifiedById || "",
      verifiedAt: initialData?.verifiedAt ? new Date(initialData.verifiedAt) : undefined,
      addressState: initialData?.addressState || "",
      addressCity: initialData?.addressCity || "",
      addressZipCode: initialData?.addressZipCode || "",
      addressLine1: initialData?.addressLine1 || "",
      addressLine2: initialData?.addressLine2 || "",
      locationFromMain: initialData?.locationFromMain || "",
      photographUrl: initialData?.photographUrl || "",
      residenceVerification: initialData?.residenceVerification || undefined,
      businessVerification: initialData?.businessVerification || undefined,
      propertyVerification: initialData?.propertyVerification || undefined,
      vehicleVerification: initialData?.vehicleVerification || undefined,
    },
  });

  // Watch the verification type to conditionally render fields
  const verificationType = watch("type");
  const verificationDate = watch("verificationDate");
  const verifiedAt = watch("verifiedAt");

  // Set the selected type for conditional rendering
  useEffect(() => {
    if (verificationType) {
      setSelectedType(verificationType);
    }
  }, [verificationType]);

  // Fetch loan applications and verification officers
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const [loanAppsResponse, officersResponse] = await Promise.all([
          getLoanApplications(),
          getVerificationOfficers(),
        ]);

        if (loanAppsResponse.success) {
          setLoanApplications(loanAppsResponse.data || []);
        }

        if (officersResponse.success) {
          setVerificationOfficers(officersResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching related data:", error);
        toast({
          title: "Error",
          description: "Failed to load related data",
          variant: "destructive",
        });
      }
    };

    fetchRelatedData();
  }, []);

  // Set form values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        const typedKey = key as keyof VerificationFormValues;
        if (initialData[typedKey] !== undefined) {
          if (["verificationDate", "verifiedAt"].includes(key) && initialData[typedKey]) {
            // Handle date fields
            setValue(typedKey, new Date(initialData[typedKey] as Date));
          } else {
            setValue(typedKey, initialData[typedKey] as any);
          }
        }
      });
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: VerificationFormValues) => {
    setIsSubmitting(true);
    try {
      let response;

      // Only include type-specific data for the selected type
      const formData = { ...data };
      if (formData.type !== "RESIDENCE") formData.residenceVerification = undefined;
      if (formData.type !== "BUSINESS") formData.businessVerification = undefined;
      if (formData.type !== "PROPERTY") formData.propertyVerification = undefined;
      if (formData.type !== "VEHICLE") formData.vehicleVerification = undefined;

      if (isEditMode && initialData?.id) {
        response = await updateVerification(initialData.id, formData);
      } else {
        response = await createVerification(formData);
      }

      if (response.success) {
        toast({
          title: isEditMode ? "Verification Updated" : "Verification Created",
          description: response.message,
        });

        router.push("/saas/verifications/list");
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

  console.log("errros", errors);

  // Get applicant name from loan application for display
  const getApplicantNameFromLoanApplication = (id: string) => {
    const loanApp = loanApplications.find((app) => app.id === id);
    if (!loanApp || !loanApp.applicant || !loanApp.applicant.user) return "Select Loan Application";

    const { firstName, lastName } = loanApp.applicant.user;
    return `${firstName || ""} ${lastName || ""}'s Application`;
  };

  // Get officer name for display
  const getOfficerName = (id: string) => {
    const officer = verificationOfficers.find((off) => off.id === id);
    if (!officer) return "Select Officer";

    return `${officer.firstName || ""} ${officer.lastName || ""}`;
  };

  return (
    <div className="w-full bg-transparent">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold">{isEditMode ? "Edit Verification" : "Create Verification"}</h2>

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

          {/* Verification Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base font-medium">
              Verification Type
            </Label>
            <Select
              onValueChange={(value) => setValue("type", value as any)}
              value={watch("type")}
              disabled={isEditMode} // Can't change verification type in edit mode
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select Verification Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENCE">Residence Verification</SelectItem>
                <SelectItem value="BUSINESS">Business Verification</SelectItem>
                <SelectItem value="PROPERTY">Property Verification</SelectItem>
                <SelectItem value="VEHICLE">Vehicle Verification</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-base font-medium">
              Verification Status
            </Label>
            <Select onValueChange={(value) => setValue("status", value as any)} value={watch("status")}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {/* Verification Date & Time */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="verificationDate" className="text-base font-medium">
                Verification Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !verificationDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {verificationDate ? format(verificationDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={verificationDate}
                    onSelect={(date) => setValue("verificationDate", date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.verificationDate && (
                <p className="mt-1 text-sm text-red-600">{errors.verificationDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationTime" className="text-base font-medium">
                Verification Time
              </Label>
              <Select onValueChange={(value) => setValue("verificationTime", value)} value={watch("verificationTime")}>
                <SelectTrigger id="verificationTime" className="w-full">
                  <SelectValue placeholder="Select Time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => {
                    const hour = i < 12 ? i : i - 12;
                    const period = i < 12 ? "AM" : "PM";
                    const time = `${hour === 0 ? 12 : hour}:00 ${period}`;
                    return (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.verificationTime && (
                <p className="mt-1 text-sm text-red-600">{errors.verificationTime.message}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Address Information</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="addressState">State</Label>
                <Input id="addressState" {...register("addressState")} placeholder="Enter state" />
                {errors.addressState && <p className="mt-1 text-sm text-red-600">{errors.addressState.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressCity">City</Label>
                <Input id="addressCity" {...register("addressCity")} placeholder="Enter city" />
                {errors.addressCity && <p className="mt-1 text-sm text-red-600">{errors.addressCity.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressZipCode">Zip Code</Label>
                <Input id="addressZipCode" {...register("addressZipCode")} placeholder="Enter zip code" />
                {errors.addressZipCode && <p className="mt-1 text-sm text-red-600">{errors.addressZipCode.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input id="addressLine1" {...register("addressLine1")} placeholder="Enter address line 1" />
              {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input id="addressLine2" {...register("addressLine2")} placeholder="Enter address line 2" />
              {errors.addressLine2 && <p className="mt-1 text-sm text-red-600">{errors.addressLine2.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationFromMain">Location from Main Road</Label>
              <Input
                id="locationFromMain"
                {...register("locationFromMain")}
                placeholder="Enter location from main road"
              />
              {errors.locationFromMain && (
                <p className="mt-1 text-sm text-red-600">{errors.locationFromMain.message}</p>
              )}
            </div>
          </div>

          {/* Type-specific fields based on verification type */}
          {selectedType === "RESIDENCE" && (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-lg font-medium">Residence Verification Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="residenceVerification.ownerFirstName">Owner First Name</Label>
                  <Input
                    id="residenceVerification.ownerFirstName"
                    {...register("residenceVerification.ownerFirstName")}
                    placeholder="Enter owner first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residenceVerification.ownerLastName">Owner Last Name</Label>
                  <Input
                    id="residenceVerification.ownerLastName"
                    {...register("residenceVerification.ownerLastName")}
                    placeholder="Enter owner last name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residenceVerification.residentSince">Resident Since</Label>
                  <Input
                    id="residenceVerification.residentSince"
                    {...register("residenceVerification.residentSince")}
                    placeholder="Enter year (e.g., 1989)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residenceVerification.residenceType">Type of Residence</Label>
                  <Select
                    onValueChange={(value) => setValue("residenceVerification.residenceType", value)}
                    value={watch("residenceVerification.residenceType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select residence type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owned">Owned</SelectItem>
                      <SelectItem value="Rented">Rented</SelectItem>
                      <SelectItem value="Leased">Leased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residenceVerification.structureType">Structure Type</Label>
                  <Select
                    onValueChange={(value) => setValue("residenceVerification.structureType", value)}
                    value={watch("residenceVerification.structureType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select structure type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Condominium">Condominium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {selectedType === "BUSINESS" && (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-lg font-medium">Business Verification Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessVerification.businessName">Business Name</Label>
                  <Input
                    id="businessVerification.businessName"
                    {...register("businessVerification.businessName")}
                    placeholder="Enter business name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessVerification.businessType">Business Type</Label>
                  <Select
                    onValueChange={(value) => setValue("businessVerification.businessType", value)}
                    value={watch("businessVerification.businessType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="LLC">LLC</SelectItem>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessVerification.contactDetails">Contact Details</Label>
                  <Input
                    id="businessVerification.contactDetails"
                    {...register("businessVerification.contactDetails")}
                    placeholder="Enter contact details"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessVerification.natureOfBusiness">Nature of Business</Label>
                  <Input
                    id="businessVerification.natureOfBusiness"
                    {...register("businessVerification.natureOfBusiness")}
                    placeholder="Enter nature of business"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessVerification.salesPerDay">Sales Per Day</Label>
                  <Input
                    id="businessVerification.salesPerDay"
                    {...register("businessVerification.salesPerDay")}
                    placeholder="Enter sales per day"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="businessVerification.businessExistence"
                    checked={watch("businessVerification.businessExistence")}
                    onCheckedChange={(checked) => setValue("businessVerification.businessExistence", checked === true)}
                  />
                  <Label htmlFor="businessVerification.businessExistence">Business Existence Confirmed</Label>
                </div>
              </div>
            </div>
          )}

          {selectedType === "PROPERTY" && (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-lg font-medium">Property Verification Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="propertyVerification.ownerFirstName">Owner First Name</Label>
                  <Input
                    id="propertyVerification.ownerFirstName"
                    {...register("propertyVerification.ownerFirstName")}
                    placeholder="Enter owner first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyVerification.ownerLastName">Owner Last Name</Label>
                  <Input
                    id="propertyVerification.ownerLastName"
                    {...register("propertyVerification.ownerLastName")}
                    placeholder="Enter owner last name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyVerification.structureType">Structure Type</Label>
                  <Select
                    onValueChange={(value) => setValue("propertyVerification.structureType", value)}
                    value={watch("propertyVerification.structureType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select structure type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {selectedType === "VEHICLE" && (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-lg font-medium">Vehicle Verification Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vehicleVerification.make">Make</Label>
                  <Input
                    id="vehicleVerification.make"
                    {...register("vehicleVerification.make")}
                    placeholder="Enter vehicle make"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleVerification.model">Model</Label>
                  <Input
                    id="vehicleVerification.model"
                    {...register("vehicleVerification.model")}
                    placeholder="Enter vehicle model"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleVerification.vehicleType">Vehicle Type</Label>
                  <Select
                    onValueChange={(value) => setValue("vehicleVerification.vehicleType", value)}
                    value={watch("vehicleVerification.vehicleType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Hatchback">Hatchback</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleVerification.engineNumber">Engine Number</Label>
                  <Input
                    id="vehicleVerification.engineNumber"
                    {...register("vehicleVerification.engineNumber")}
                    placeholder="Enter engine number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleVerification.chassisNumber">Chassis Number</Label>
                  <Input
                    id="vehicleVerification.chassisNumber"
                    {...register("vehicleVerification.chassisNumber")}
                    placeholder="Enter chassis number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleVerification.registrationNumber">Registration Number</Label>
                  <Input
                    id="vehicleVerification.registrationNumber"
                    {...register("vehicleVerification.registrationNumber")}
                    placeholder="Enter registration number"
                  />
                </div>

                {/* Document URLs could be implemented as file upload fields with proper handling */}
                <div className="space-y-2">
                  <Label htmlFor="vehicleVerification.taxInvoiceUrl">Tax Invoice URL</Label>
                  <Input
                    id="vehicleVerification.taxInvoiceUrl"
                    {...register("vehicleVerification.taxInvoiceUrl")}
                    placeholder="Enter tax invoice URL"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          <MultiImageUpload
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
            verificationId={initialData?.id}
            fieldName="photographUrl"
            label="Verification Photographs"
            currentUserId={user?.id}
          />
          {/* Result & Remarks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="result"
                checked={watch("result")}
                onCheckedChange={(checked) => setValue("result", checked === true)}
              />
              <Label htmlFor="result">Verification Result (Checked = Passed, Unchecked = Failed)</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                {...register("remarks")}
                placeholder="Enter verification remarks"
                className="min-h-[100px]"
              />
              {errors.remarks && <p className="mt-1 text-sm text-red-600">{errors.remarks.message}</p>}
            </div>
          </div>

          {/* Verification Officer */}
          <div className="space-y-2">
            <Label htmlFor="verifiedById" className="text-base font-medium">
              Verification Officer
            </Label>
            <Select onValueChange={(value) => setValue("verifiedById", value)} value={watch("verifiedById")}>
              <SelectTrigger id="verifiedById" className="w-full">
                <SelectValue placeholder="Select Verification Officer">
                  {watch("verifiedById") ? getOfficerName(watch("verifiedById")) : "Select Verification Officer"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {verificationOfficers.map((officer) => (
                  <SelectItem key={officer.id} value={officer.id}>
                    {officer.firstName} {officer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.verifiedById && <p className="mt-1 text-sm text-red-600">{errors.verifiedById.message}</p>}
          </div>

          {/* Verification Time */}
          <div className="space-y-2">
            <Label htmlFor="verifiedAt" className="text-base font-medium">
              Verified At
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !verifiedAt && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {verifiedAt ? format(verifiedAt, "PPP") : "Select verification date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={verifiedAt}
                  onSelect={(date) => setValue("verifiedAt", date as Date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.verifiedAt && <p className="mt-1 text-sm text-red-600">{errors.verifiedAt.message}</p>}
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/saas/verifications/list")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : isEditMode ? "Update Verification" : "Create Verification"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
