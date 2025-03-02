"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoanStreamPage() {
  // For demonstration, the handlers are left as no-ops
  const handleLoanTypeChange = (value: string) => {
    console.log("Selected loan type:", value);
  };

  const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("First Name:", event.target.value);
  };

  const handleLastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Last Name:", event.target.value);
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Phone Number:", event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Email:", event.target.value);
  };

  const handleSendLink = () => {
    console.log("Send Link clicked");
  };

  const handleContinue = () => {
    console.log("Continue clicked");
  };

  return (
    <div className="bg-default-background w-full px-6 py-12">
      <div className="mx-left flex max-w-[448px] flex-col gap-12">
        {/* Heading */}
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold">New Loan Application</span>
          <span className="text-sm text-gray-500">
            Fill in the customer&#39;s basic information to begin the application process
          </span>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          {/* Loan Type Select */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="loanType">Type of Loan</Label>
            <Select onValueChange={handleLoanTypeChange}>
              <SelectTrigger id="loanType" className="w-full">
                <SelectValue placeholder="Select loan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Mortgage">Mortgage</SelectItem>
                <SelectItem value="Auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* First + Last Name */}
          <div className="flex w-full items-start gap-4">
            <div className="flex w-full flex-col gap-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="Enter first name" onChange={handleFirstNameChange} />
            </div>
            <div className="flex w-full flex-col gap-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Enter last name" onChange={handleLastNameChange} />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex w-full flex-col gap-1">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" placeholder="Enter phone number" onChange={handlePhoneChange} />
          </div>

          {/* Email Address */}
          <div className="flex w-full flex-col gap-1">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" placeholder="Enter email address" onChange={handleEmailChange} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex w-full items-center gap-4">
          <Button variant="secondary" className="flex-1" onClick={handleSendLink}>
            Send Link
          </Button>
          <Button className="flex-1" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
