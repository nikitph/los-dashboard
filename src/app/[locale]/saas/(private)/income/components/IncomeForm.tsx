"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Briefcase, Building, Plus, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { saveIncomeData } from "../actions";
import { toast } from "@/hooks/use-toast";

// Zod Schema
const incomeDetailSchema = z.object({
  year: z.number(),
  taxableIncome: z
    .string()
    .transform((value) => (value ? parseFloat(value) : null))
    .optional()
    .nullable(),
  taxPaid: z
    .string()
    .transform((value) => (value ? parseFloat(value) : null))
    .optional()
    .nullable(),
  grossIncome: z
    .string()
    .transform((value) => (value ? parseFloat(value) : null))
    .optional()
    .nullable(),
  rentalIncome: z
    .string()
    .transform((value) => (value ? parseFloat(value) : null))
    .optional()
    .nullable(),
  incomeFromBusiness: z
    .string()
    .transform((value) => (value ? parseFloat(value) : null))
    .optional()
    .nullable(),
  depreciation: z
    .string()
    .transform((value) => (value ? parseFloat(value) : null))
    .optional()
    .nullable(),
  grossCashIncome: z
    .string()
    .transform((value) => (value ? parseFloat(value) : null))
    .optional()
    .nullable(),
});

const FormSchema = z.object({
  type: z.string().min(1, "Please select your employment type"),
  incomeDetails: z.array(incomeDetailSchema),
  dependents: z.string().min(0).optional(),
  averageMonthlyExpenditure: z.string().min(0).optional(),
  averageGrossCashIncome: z.string().min(0).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface IncomeFormProps {
  applicantId: string;
}

export default function IncomeForm({ applicantId }: IncomeFormProps) {
  const [years, setYears] = useState([1]);
  const [activeYear, setActiveYear] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: "",
      dependents: "",
      averageMonthlyExpenditure: "",
      averageGrossCashIncome: "",
      incomeDetails: [
        {
          year: 1,
          taxableIncome: null,
          taxPaid: null,
          grossIncome: null,
          rentalIncome: null,
          incomeFromBusiness: null,
          depreciation: null,
          grossCashIncome: null,
        },
      ],
    },
  });

  const watchedType = watch("type");
  const watchedIncomeDetails = watch("incomeDetails");

  const addYear = () => {
    const newYear = years.length + 1;
    setYears((prev) => [...prev, newYear]);
    setActiveYear(newYear);

    // Add a new year with fresh empty values
    setValue("incomeDetails", [
      ...watchedIncomeDetails,
      {
        year: newYear,
        taxableIncome: null,
        taxPaid: null,
        grossIncome: null,
        rentalIncome: null,
        incomeFromBusiness: null,
        depreciation: null,
        grossCashIncome: null,
      },
    ]);
  };

  const removeYear = () => {
    if (years.length > 1) {
      setYears((prev) => prev.slice(0, -1));
      setActiveYear((prev) => (prev === years.length ? prev - 1 : prev));

      // Remove the last year from incomeDetails array
      const newIncomeDetails = [...watchedIncomeDetails];
      newIncomeDetails.pop();
      setValue("incomeDetails", newIncomeDetails);
    }
  };

  const calculateTotalIncome = () => {
    return watchedIncomeDetails.reduce((sum, income) => {
      return (
        sum +
        (Number(income?.taxableIncome) || 0) +
        (Number(income?.taxPaid) || 0) +
        (Number(income?.grossIncome) || 0) +
        (Number(income?.rentalIncome) || 0) +
        (Number(income?.incomeFromBusiness) || 0) +
        (Number(income?.depreciation) || 0)
      );
    }, 0);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("applicantId", applicantId);
      formData.append("type", data.type);
      formData.append("incomeDetails", JSON.stringify(data.incomeDetails));
      formData.append("dependents", data.dependents || "");
      formData.append("averageMonthlyExpenditure", data.averageMonthlyExpenditure || "");
      formData.append("averageGrossCashIncome", data.averageGrossCashIncome || "");

      // Append documents
      documents.forEach((doc, index) => {
        formData.append(`document-${index}`, doc);
      });

      const response = await saveIncomeData(formData);

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        // You can add navigation logic here
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
        <div className="w-full max-w-4xl space-y-6">
          {/* Header with Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Income Documentation</h1>
              <span className="text-sm text-gray-500">Step 3/4</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-sm text-gray-500">
              Provide income details for the last {years.length} {years.length > 1 ? "years" : "year"}
            </p>
          </div>

          {/* Employment Type Card */}
          <Card>
            <div className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">Tell us about your employment</h3>
              <ToggleGroup
                type="single"
                value={watchedType}
                onValueChange={(value) => setValue("type", value)}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <ToggleGroupItem value="SALARIED" className="h-24 flex-col gap-2" id="salaried">
                  <Briefcase className="h-6 w-6" />
                  <span className="font-medium">Salaried</span>
                  <span className="text-sm text-gray-500">Full-time employment</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="BUSINESS" className="h-24 flex-col gap-2" id="business">
                  <Building className="h-6 w-6" />
                  <span className="font-medium">Business Owner</span>
                  <span className="text-sm text-gray-500">Self-employed or entrepreneur</span>
                </ToggleGroupItem>
              </ToggleGroup>
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>
          </Card>

          {/* Year Navigation */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Tabs value={activeYear.toString()}>
              <TabsList>
                {years.map((year) => (
                  <TabsTrigger key={year} value={year.toString()} onClick={() => setActiveYear(year)}>
                    Year {year}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={addYear} className="gap-2" type="button">
                      <Plus className="h-4 w-4" />
                      Add Year
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add another financial year</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={removeYear}
                      disabled={years.length === 1}
                    >
                      Remove Year
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {years.length === 1 ? "At least one year required" : "Remove last financial year"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Income Inputs */}
          <Card>
            <div className="space-y-6 p-6">
              <h3 className="mb-4 text-lg font-semibold">Year {activeYear} Income Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { key: "taxableIncome", label: "Taxable Income" },
                  { key: "taxPaid", label: "Tax Paid" },
                  { key: "grossIncome", label: "Gross Income" },
                  { key: "rentalIncome", label: "Rental Income" },
                  { key: "incomeFromBusiness", label: "Income From Business" },
                  { key: "depreciation", label: "Depreciation" },
                  { key: "grossCashIncome", label: "Gross Cash Income" },
                ].map(({ key, label }) => {
                  const yearIndex = activeYear - 1;
                  return (
                    <div key={`${key}-${activeYear}`} className="space-y-2">
                      <Label htmlFor={`${key}-${activeYear}`}>{label}</Label>
                      <Input
                        id={`${key}-${activeYear}`}
                        placeholder="Enter amount"
                        className="pl-8"
                        {...register(`incomeDetails.${yearIndex}.${key as any}`)}
                      />
                      {errors.incomeDetails?.[yearIndex]?.[key as keyof (typeof errors.incomeDetails)[0]] && (
                        <p className="text-sm text-red-500">
                          {errors.incomeDetails[yearIndex]?.[key as keyof (typeof errors.incomeDetails)[0]]?.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Gross Cash Income</h4>
                  <div className="text-2xl font-semibold text-primary">₹{calculateTotalIncome().toLocaleString()}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Average Gross Cash Income</h4>
                <div className="text-2xl font-semibold text-primary">₹{calculateTotalIncome().toLocaleString()}</div>
              </div>
            </div>
          </Card>

          {/* Document Upload */}
          <Card>
            <div className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">Supporting Documents</h3>
              <div className="space-y-3">
                <Label htmlFor="document-upload">Upload Income Documents</Label>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <input
                    type="file"
                    id="document-upload"
                    multiple
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                  />
                  <label htmlFor="document-upload" className="flex cursor-pointer flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                    <span className="text-xs text-gray-500">PDF, JPG, PNG (max 10MB)</span>
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium">Uploaded Documents:</h4>
                    <ul className="space-y-1 text-sm">
                      {documents.map((doc, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="rounded-md bg-primary/10 px-2 py-1 text-primary">{doc.name}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6 p-6">
              <h3 className="text-lg font-semibold">General Income Information</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dependents">Number of Dependents</Label>
                  <Input id="dependents" placeholder="Enter number" className="pl-8" {...register("dependents")} />
                  {errors.dependents && <p className="text-sm text-red-500">{errors.dependents.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="averageMonthlyExpenditure">Average Monthly Expenditure</Label>
                  <Input
                    id="averageMonthlyExpenditure"
                    placeholder="Enter amount or percentage"
                    className="pl-8"
                    defaultValue="20% or more"
                    {...register("averageMonthlyExpenditure")}
                  />
                  {errors.averageMonthlyExpenditure && (
                    <p className="text-sm text-red-500">{errors.averageMonthlyExpenditure.message}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse justify-end gap-4 sm:flex-row">
            <Button variant="outline" className="gap-2" type="button">
              <ArrowLeft className="h-4 w-4" />
              Previous Step
            </Button>
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Save & Continue"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
