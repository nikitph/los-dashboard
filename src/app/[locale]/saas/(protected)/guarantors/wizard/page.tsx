"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Guarantor {
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
  const [guarantors, setGuarantors] = React.useState<Guarantor[]>([
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

  const addGuarantor = () => {
    setGuarantors((prev) => [
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

  const updateGuarantor = (id: number, field: keyof Guarantor, value: string) => {
    setGuarantors((prev) =>
      prev.map((guarantor) => (guarantor.id === id ? { ...guarantor, [field]: value } : guarantor)),
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
          <span className="text-lg font-bold text-foreground">Guarantor Details</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Yes</span>
          <Switch checked={false} onCheckedChange={(checked: boolean) => {}} />
          <span className="text-sm text-foreground">No</span>
        </div>
      </div>

      {/* Dynamic Accordion for Guarantors */}
      <Accordion type="multiple" className="w-full px-6">
        {guarantors.map((guarantor) => (
          <AccordionItem key={guarantor.id} value={`guarantor-${guarantor.id}`}>
            <AccordionTrigger className="flex w-full items-center justify-between bg-primary px-4 py-3">
              <span className="text-base font-bold text-white">Guarantor {guarantor.id} Details</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-6">
              {/* Name Fields */}
              <div className="flex w-full flex-wrap gap-4">
                <div className="flex-1">
                  <Label htmlFor={`first-name-${guarantor.id}`}>First Name</Label>
                  <Input
                    id={`first-name-${guarantor.id}`}
                    placeholder="First name"
                    value={guarantor.firstName}
                    onChange={(e) => updateGuarantor(guarantor.id, "firstName", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`last-name-${guarantor.id}`}>Last Name</Label>
                  <Input
                    id={`last-name-${guarantor.id}`}
                    placeholder="Last name"
                    value={guarantor.lastName}
                    onChange={(e) => updateGuarantor(guarantor.id, "lastName", e.target.value)}
                  />
                </div>
              </div>

              {/* Permanent Address */}
              <div className="mt-6 flex flex-col gap-4">
                <span className="text-sm text-muted-foreground">Permanent Address</span>
                <div className="flex w-full flex-wrap gap-4">
                  <div className="flex-1">
                    <Select
                      value={guarantor.state}
                      onValueChange={(value: string) => updateGuarantor(guarantor.id, "state", value)}
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
                      value={guarantor.city}
                      onValueChange={(value: string) => updateGuarantor(guarantor.id, "city", value)}
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
                      value={guarantor.zip}
                      onValueChange={(value: string) => updateGuarantor(guarantor.id, "zip", value)}
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
                  <Label htmlFor={`address1-${guarantor.id}`}>Full Address 1</Label>
                  <Input
                    id={`address1-${guarantor.id}`}
                    placeholder="Full Address 1"
                    value={guarantor.address1}
                    onChange={(e) => updateGuarantor(guarantor.id, "address1", e.target.value)}
                    className="w-full"
                  />
                  <Label htmlFor={`address2-${guarantor.id}`}>Full Address 2</Label>
                  <Input
                    id={`address2-${guarantor.id}`}
                    placeholder="Full Address 2"
                    value={guarantor.address2}
                    onChange={(e) => updateGuarantor(guarantor.id, "address2", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="mt-6">
                <Label htmlFor={`mobile-number-${guarantor.id}`}>Mobile Number</Label>
                <Input
                  id={`mobile-number-${guarantor.id}`}
                  placeholder="Enter mobile number"
                  value={guarantor.mobileNumber}
                  onChange={(e) => updateGuarantor(guarantor.id, "mobileNumber", e.target.value)}
                  className="w-full"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Button to add another guarantor */}
      <div className="px-6">
        <Button variant="outline" onClick={addGuarantor}>
          Add another guarantor
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
