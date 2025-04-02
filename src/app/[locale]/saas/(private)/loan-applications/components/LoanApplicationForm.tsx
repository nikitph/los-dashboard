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

import {
  createLoanApplication,
  getApplicants,
  getBanks,
  updateLoanApplication,
} from "@/app/[locale]/saas/(private)/loan-applications/actions";
import { LoanApplicationSchema } from "@/schemas/zodSchemas";

type LoanApplicationFormValues = z.infer<typeof LoanApplicationSchema>;

interface LoanApplicationFormProps {
  initialData?: Partial<LoanApplicationFormValues> & { id?: string };
  isEditMode?: boolean;
}

export default function LoanApplicationForm({ initialData, isEditMode = false }: LoanApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banks, setBanks] = useState<{ id: string; name: string }[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LoanApplicationFormValues>({
    resolver: zodResolver(LoanApplicationSchema),
    defaultValues: {
      applicantId: initialData?.applicantId || "",
      bankId: initialData?.bankId || "",
      loanType: initialData?.loanType || "PERSONAL",
      amountRequested: initialData?.amountRequested || 0,
      status: initialData?.status || "PENDING",
    },
  });

  // Watch values for conditional rendering
  const loanType = watch("loanType");
  const status = watch("status");

  // Fetch banks and applicants on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [banksResponse, applicantsResponse] = await Promise.all([getBanks(), getApplicants()]);

        if (banksResponse.success) {
          setBanks(banksResponse.data || []);
        }

        if (applicantsResponse.success) {
          setApplicants(applicantsResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  // Set form values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        const typedKey = key as keyof LoanApplicationFormValues;
        if (initialData[typedKey] !== undefined) {
          setValue(typedKey, initialData[typedKey] as any);
        }
      });
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: LoanApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      let response;

      if (isEditMode && initialData?.id) {
        response = await updateLoanApplication(initialData.id, data);
      } else {
        response = await createLoanApplication(data);
      }

      if (response.success) {
        toast({
          title: isEditMode ? "Loan Application Updated" : "Loan Application Created",
          description: response.message,
        });

        router.push("/saas/loan-applications/list");
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

  console.log(errors);

  // Format applicant name
  const getApplicantName = (id: string) => {
    const applicant = applicants.find((app) => app.id === id);
    if (!applicant) return "Select Applicant";
    return `${applicant.user.firstName || "No"} ${applicant.user.lastName || "Name"}`;
  };

  return (
    <div className="w-full bg-transparent">
      <div className="mx-left flex max-w-[600px] flex-col gap-12">
        {/* Heading Section */}
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold">{isEditMode ? "Edit Loan Application" : "New Loan Application"}</span>
          <span className="text-sm text-gray-500">
            Fill in the customer&#39;s basic information to begin the application process
          </span>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Applicant Selection */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="applicantId">Applicant</Label>
            <Select onValueChange={(value) => setValue("applicantId", value)} value={watch("applicantId")}>
              <SelectTrigger id="applicantId" className="w-full">
                <SelectValue placeholder="Select Applicant">
                  {watch("applicantId") ? getApplicantName(watch("applicantId")) : "Select Applicant"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {applicants.map((applicant) => (
                  <SelectItem key={applicant.id} value={applicant.id}>
                    {`${applicant.user.firstName || ""} ${applicant.user.lastName || ""}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.applicantId && <p className="mt-1 text-sm text-red-600">{errors.applicantId.message}</p>}
          </div>

          {/* Bank Selection */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="bankId">Bank</Label>
            <Select onValueChange={(value) => setValue("bankId", value)} value={watch("bankId")}>
              <SelectTrigger id="bankId" className="w-full">
                <SelectValue placeholder="Select Bank">
                  {watch("bankId")
                    ? banks.find((bank) => bank.id === watch("bankId"))?.name || "Select Bank"
                    : "Select Bank"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankId && <p className="mt-1 text-sm text-red-600">{errors.bankId.message}</p>}
          </div>

          {/* Loan Type */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="loanType">Type of Loan</Label>
            <Select onValueChange={(value) => setValue("loanType", value)} value={watch("loanType")}>
              <SelectTrigger id="loanType" className="w-full">
                <SelectValue placeholder="Select Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                <SelectItem value="VEHICLE">Vehicle Loan</SelectItem>
                <SelectItem value="HOUSE_CONSTRUCTION">House Construction</SelectItem>
                <SelectItem value="PLOT_PURCHASE">Plot Purchase</SelectItem>
                <SelectItem value="MORTGAGE">Mortgage Loan</SelectItem>
              </SelectContent>
            </Select>
            {errors.loanType && <p className="mt-1 text-sm text-red-600">{errors.loanType.message}</p>}
          </div>

          {/* Amount Requested */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="amountRequested">Requested Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <Input
                id="amountRequested"
                type="number"
                placeholder="Enter loan amount"
                className="pl-8"
                {...register("amountRequested", { valueAsNumber: true })}
              />
            </div>
            {errors.amountRequested && <p className="mt-1 text-sm text-red-600">{errors.amountRequested.message}</p>}
          </div>

          {/* Status Selection */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue("status", value)} value={watch("status")}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {/* Conditionally Render More Fields */}
          {status === "UNDER_REVIEW" && (
            <div className="flex flex-col gap-2 rounded-md border border-dashed p-4">
              <span className="text-sm font-semibold">Review Details</span>
              <p className="text-sm text-gray-500">
                Additional fields for review details would be included here, such as assigned reviewer, verification
                checklist, etc.
              </p>
            </div>
          )}

          {status === "APPROVED" && (
            <div className="flex flex-col gap-2 rounded-md border border-dashed p-4">
              <span className="text-sm font-semibold">Approval Details</span>
              <p className="text-sm text-gray-500">
                Additional fields for approval details would be included here, such as approval date, approved amount,
                interest rate, etc.
              </p>
            </div>
          )}

          {status === "REJECTED" && (
            <div className="flex flex-col gap-2 rounded-md border border-dashed p-4">
              <span className="text-sm font-semibold">Rejection Details</span>
              <p className="text-sm text-gray-500">
                Additional fields for rejection details would be included here, such as rejection reason, rejection
                date, etc.
              </p>
            </div>
          )}

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex w-full items-center gap-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : isEditMode ? "Update Loan Application" : "Create Loan Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
