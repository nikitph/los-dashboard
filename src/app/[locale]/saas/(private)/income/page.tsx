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
import { ArrowLeft, ArrowRight, Briefcase, Building, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Zod Schema
const incomeFieldsSchema = z.object({
  taxableIncomeITR: z.string().optional(),
  taxPaidITR: z.string().optional(),
  grossIncomeCOI: z.string().optional(),
  rentalIncome: z.string().optional(),
  incomeFromBusiness: z.string().optional(),
  depreciationCOI: z.string().optional(),
  grossCashIncome: z.string().optional(),
});

const FormSchema = z.object({
  dependents: z.string().optional(),
  monthlyExpenditure: z.string().optional(),
  incomes: z.record(z.string(), incomeFieldsSchema),
});

export default function LoanStream() {
  const [years, setYears] = useState([1]);
  const [activeYear, setActiveYear] = useState(1);
  const [employmentType, setEmploymentType] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dependents: "",
      monthlyExpenditure: "",
      incomes: {
        "1": {
          taxableIncomeITR: "",
          taxPaidITR: "",
          grossIncomeCOI: "",
          rentalIncome: "",
          incomeFromBusiness: "",
          depreciationCOI: "",
          grossCashIncome: "",
        },
      },
    },
  });

  const watchedIncomes = watch("incomes");

  const addYear = () => {
    const newYear = years.length + 1;
    setYears((prev) => [...prev, newYear]);
    setActiveYear(newYear);
    setValue(`incomes.${newYear}`, {
      taxableIncomeITR: "",
      taxPaidITR: "",
      grossIncomeCOI: "",
      rentalIncome: "",
      incomeFromBusiness: "",
      depreciationCOI: "",
      grossCashIncome: "",
    });
  };

  const removeYear = () => {
    if (years.length > 1) {
      const lastYear = years[years.length - 1];
      setYears((prev) => prev.slice(0, -1));
      setValue(`incomes.${lastYear}`, undefined);
      setActiveYear((prev) => (prev === lastYear ? prev - 1 : prev));
    }
  };

  const calculateTotalIncome = () => {
    return Object.values(watchedIncomes || {}).reduce((sum, income) => {
      return (
        sum +
        (Number(income?.taxableIncomeITR) || 0) +
        (Number(income?.taxPaidITR) || 0) +
        (Number(income?.grossIncomeCOI) || 0) +
        (Number(income?.rentalIncome) || 0) +
        (Number(income?.incomeFromBusiness) || 0) +
        (Number(income?.depreciationCOI) || 0) +
        (Number(income?.grossCashIncome) || 0)
      );
    }, 0);
  };

  const onSubmit = (data: any) => {
    console.log("Submitted:", data);
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
                value={employmentType}
                onValueChange={setEmploymentType}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <ToggleGroupItem value="salaried" className="h-24 flex-col gap-2" id="salaried">
                  <Briefcase className="h-6 w-6" />
                  <span className="font-medium">Salaried</span>
                  <span className="text-sm text-gray-500">Full-time employment</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="business" className="h-24 flex-col gap-2" id="business">
                  <Building className="h-6 w-6" />
                  <span className="font-medium">Business Owner</span>
                  <span className="text-sm text-gray-500">Self-employed or entrepreneur</span>
                </ToggleGroupItem>
              </ToggleGroup>
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
                    <Button variant="outline" size="sm" onClick={addYear} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Year
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add another financial year</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={removeYear} disabled={years.length === 1}>
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
                  { key: "taxableIncomeITR", label: "Taxable Income as per ITR" },
                  { key: "taxPaidITR", label: "Tax Paid as per ITR" },
                  { key: "grossIncomeCOI", label: "Gross Income as per COI" },
                  { key: "rentalIncome", label: "Rental Income" },
                  { key: "incomeFromBusiness", label: "Income From Business" },
                  { key: "depreciationCOI", label: "Depreciation as per COI" },
                  { key: "grossCashIncome", label: "Gross Cash Income" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`${key}-${activeYear}`}>{label}</Label>
                    <Input
                      id={`${key}-${activeYear}`}
                      placeholder="Enter amount"
                      className="pl-8"
                      {...register(`incomes.${activeYear}.${key}`)}
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Combined Total Income</h4>
                  <div className="text-2xl font-semibold text-primary">₹{calculateTotalIncome().toLocaleString()}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Document Upload */}
          <Card>
            <div className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">Supporting Documents</h3>
              <div className="space-y-3">{/* Dropzones (placeholder) */}</div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse justify-end gap-4 sm:flex-row">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Previous Step
            </Button>
            <Button type="submit" className="gap-2">
              Save & Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
