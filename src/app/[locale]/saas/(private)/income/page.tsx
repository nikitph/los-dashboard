"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Briefcase, Save, TrendingUp, Upload } from "lucide-react";

export default function LoanStream() {
  const [years, setYears] = useState([1]);

  const addYear = () => {
    setYears((prev) => [...prev, prev.length + 1]);
  };

  const removeYear = () => {
    if (years.length > 1) {
      setYears((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-6 p-6">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-2xl font-semibold">Income Documentation</h2>
          <p className="text-muted-foreground">Please provide your income details for the last 3 years</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button>Continue</Button>
        </div>
      </div>

      {/* Employment Type */}
      <Card className="w-full p-6">
        <h3 className="mb-4 text-lg font-semibold">Employment Type</h3>
        <ToggleGroup type="single" className="flex gap-4">
          <ToggleGroupItem value="salaried" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Salaried Employee
          </ToggleGroupItem>
          <ToggleGroupItem value="business" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Business Owner
          </ToggleGroupItem>
        </ToggleGroup>
      </Card>

      {/* Income Sections by Year */}
      <Accordion type="single" collapsible className="w-full">
        {years.map((year) => (
          <AccordionItem key={year} value={`year-${year}`}>
            <AccordionTrigger className="text-base font-medium text-black">Year {year} Income Details</AccordionTrigger>
            <AccordionContent>
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {["Taxable Income (ITR)", "Tax Paid (ITR)", "Gross Income (COI)", "Rental Income"].map(
                    (label, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <Label>{label}</Label>
                        <Input placeholder="Enter amount" />
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-6 flex w-full items-center justify-between rounded-md bg-muted px-4 py-4">
                  <span className="font-medium">Total Annual Income (Year {year})</span>
                  <span className="text-xl font-bold text-primary">₹ 0.00</span>
                </div>
                <Card className="mt-6 p-6">
                  <h4 className="mb-4 font-semibold">Supporting Documents</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload ITR
                    </Button>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Salary Slips
                    </Button>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Bank Statements
                    </Button>
                  </div>
                </Card>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Add / Remove Year */}
      <div className="flex w-full items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={addYear}>
          Add Year
        </Button>
        <Button variant="outline" onClick={removeYear} disabled={years.length === 1}>
          Remove Year
        </Button>
      </div>

      {/* Additional Details */}
      <Card className="w-full p-6">
        <h3 className="mb-4 text-lg font-semibold">Additional Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {["Number of Dependents", "Average Monthly Expenditure"].map((label, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <Label>{label}</Label>
              <Input placeholder="Enter value" />
            </div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div className="flex w-full items-center justify-between border-t pt-4">
        <Button variant="outline">Back</Button>
        <Button>
          Proceed to Loan Verification
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
