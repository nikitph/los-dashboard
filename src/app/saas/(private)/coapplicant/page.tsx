"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CoApplicant {
  id: number;
  firstName: string;
  lastName: string;
  state: string;
  city: string;
  zip: string;
  address1: string;
  address2: string;
  mobileNumber: string;
}

export default function LoanStream() {
  const [coApplicants, setCoApplicants] = React.useState<CoApplicant[]>([
    {
      id: 1,
      firstName: "",
      lastName: "",
      state: "",
      city: "",
      zip: "",
      address1: "",
      address2: "",
      mobileNumber: "",
    },
  ]);

  const addCoApplicant = () => {
    setCoApplicants((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        firstName: "",
        lastName: "",
        state: "",
        city: "",
        zip: "",
        address1: "",
        address2: "",
        mobileNumber: "",
      },
    ]);
  };

  const updateCoApplicant = (id: number, field: keyof CoApplicant, value: string) => {
    setCoApplicants((prev) =>
      prev.map((applicant) => (applicant.id === id ? { ...applicant, [field]: value } : applicant)),
    );
  };

  return (
    <div className="mx-left container flex min-h-full max-w-[600px] flex-col gap-6 bg-background py-12">
      {/* Header */}
      <div className="flex w-full items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => {}}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold text-foreground">Co Applicant Details</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Yes</span>
          <Switch checked={false} onCheckedChange={(checked: boolean) => {}} />
          <span className="text-sm text-foreground">No</span>
        </div>
      </div>

      {/* Dynamic Accordion for Co-Applicants */}
      <Accordion type="multiple" className="w-full px-6">
        {coApplicants.map((applicant) => (
          <AccordionItem key={applicant.id} value={`coapplicant-${applicant.id}`}>
            <AccordionTrigger className="flex w-full items-center justify-between bg-primary px-4 py-3">
              <span className="text-base font-bold text-white">Co-applicant {applicant.id} Details</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-6">
              {/* Name Fields */}
              <div className="flex w-full flex-wrap gap-4">
                <div className="flex-1">
                  <Label htmlFor={`first-name-${applicant.id}`}>First Name</Label>
                  <Input
                    id={`first-name-${applicant.id}`}
                    placeholder="First name"
                    value={applicant.firstName}
                    onChange={(e) => updateCoApplicant(applicant.id, "firstName", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`last-name-${applicant.id}`}>Last Name</Label>
                  <Input
                    id={`last-name-${applicant.id}`}
                    placeholder="Last name"
                    value={applicant.lastName}
                    onChange={(e) => updateCoApplicant(applicant.id, "lastName", e.target.value)}
                  />
                </div>
              </div>

              {/* Permanent Address */}
              <div className="mt-6 flex flex-col gap-4">
                <span className="text-sm text-muted-foreground">Permanent Address</span>
                <div className="flex w-full flex-wrap gap-4">
                  <div className="flex-1">
                    <Select
                      value={applicant.state}
                      onValueChange={(value: string) => updateCoApplicant(applicant.id, "state", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="state1">state1</SelectItem>
                        <SelectItem value="state2">state2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={applicant.city}
                      onValueChange={(value: string) => updateCoApplicant(applicant.id, "city", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="city1">city1</SelectItem>
                        <SelectItem value="city2">city2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={applicant.zip}
                      onValueChange={(value: string) => updateCoApplicant(applicant.id, "zip", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select zip code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zip1">zip1</SelectItem>
                        <SelectItem value="zip2">zip2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`address1-${applicant.id}`}>Full Address 1</Label>
                  <Input
                    id={`address1-${applicant.id}`}
                    placeholder="Full Address 1"
                    value={applicant.address1}
                    onChange={(e) => updateCoApplicant(applicant.id, "address1", e.target.value)}
                    className="w-full"
                  />
                  <Label htmlFor={`address2-${applicant.id}`}>Full Address 2</Label>
                  <Input
                    id={`address2-${applicant.id}`}
                    placeholder="Full Address 2"
                    value={applicant.address2}
                    onChange={(e) => updateCoApplicant(applicant.id, "address2", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="mt-6">
                <Label htmlFor={`mobile-number-${applicant.id}`}>Mobile Number</Label>
                <Input
                  id={`mobile-number-${applicant.id}`}
                  placeholder="Enter mobile number"
                  value={applicant.mobileNumber}
                  onChange={(e) => updateCoApplicant(applicant.id, "mobileNumber", e.target.value)}
                  className="w-full"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Button to add another co-applicant */}
      <div className="px-6">
        <Button variant="outline" onClick={addCoApplicant}>
          Add another coapplicant
        </Button>
      </div>

      {/* Footer Buttons */}
      <div className="flex w-full gap-4 px-6">
        <Button size="lg" variant="outline" onClick={() => {}}>
          Go back
        </Button>
        <Button size="lg" variant="secondary" onClick={() => {}}>
          Proceed to Loan Details
        </Button>
      </div>
    </div>
  );
}
