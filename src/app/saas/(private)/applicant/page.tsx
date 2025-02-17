"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplicantSchema } from "@/schemas/zodSchemas";
import { indianStates } from "@/lib/utils";

// Infer the TypeScript type from the schema
type ApplicantFormValues = z.infer<typeof ApplicantSchema>;

export default function Home() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicantFormValues>({
    resolver: zodResolver(ApplicantSchema),
    defaultValues: {
      id: "",
      userId: "",
      dateOfBirth: new Date(),
      addressState: "Madhya Pradesh",
      addressCity: "",
      addressFull: "",
      addressPinCode: "",
      aadharNumber: "",
      panNumber: "",
      loanType: "PERSONAL", // default enum value
      aadharVerificationStatus: false,
      panVerificationStatus: false,
      photoUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const onSubmit = (data: ApplicantFormValues) => {
    console.log("Validated data:", data);
    alert("Form submitted!");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content */}
      <div className="flex-1 p-8">
        <h2 className="mb-4 text-2xl font-semibold">New Application</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Loan Type */}
          <div>
            <Label htmlFor="loanType" className="block text-sm font-medium text-gray-700">
              Type Of Loan
            </Label>
            <Select onValueChange={(value) => setValue("loanType", value)} value={watch("loanType")}>
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
            {errors.loanType && <p className="mt-1 text-sm text-red-600">{errors.loanType.message}</p>}
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
                  <Input type="text" placeholder="OTP" className="w-24 max-w-[200px] bg-white" />
                  <Button variant="default" className="max-w-[200px]">
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
                  <Input type="text" placeholder="OTP" className="w-24 max-w-[200px] bg-white" />
                  <Button variant="default" className="max-w-[200px]">
                    Verify
                  </Button>
                </div>
                {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber.message}</p>}
                <p className="mt-1 text-sm text-gray-500">Less than 5 MB</p>
              </div>
            </div>
          </div>

          {/* Name Fields (Not in schema, handled separately if needed) */}
          <div className="grid max-w-[450px] grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </Label>
              <Input
                type="text"
                id="firstName"
                className="mt-1 max-w-[200px] bg-white"
                // If desired, register firstName here if added to the schema.
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </Label>
              <Input
                type="text"
                id="lastName"
                className="mt-1 max-w-[200px] bg-white"
                // If desired, register lastName here if added to the schema.
              />
            </div>
          </div>

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
              {/* States Dropdown using all Indian states */}
              <Select
                onValueChange={(value) => setValue("addressState", value)}
                value={watch("addressState")}
                defaultValue={"Madhya Pradesh"}
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

          {/* Submit Button */}
          <div className="justify-left flex">
            <Button type="submit" className="max-w-[200px] px-6 py-3">
              Proceed to Individual Details
            </Button>
          </div>
          <p className="text-left text-sm text-gray-500">Please Validate Aadhar and PAN card</p>
        </form>
      </div>
    </div>
  );
}
