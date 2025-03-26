"use client";

import { CreditCard } from "lucide-react";
import { useState } from "react";
import { BankCreationForm } from "@/app/saas/(auth)/banksignup/BankCreationForm";
import { HorizontalSteps } from "@/components/HorizontalSteps";
import { BankSignupForm } from "@/app/saas/(auth)/banksignup/BankSignupForm";
import { signup } from "@/app/saas/(auth)/banksignup/actions";
import { BankInformationForm } from "@/app/saas/(auth)/banksignup/BankInformationForm";

export default function BankSignupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { title: "Admin", description: "Admin" },
    { title: "Bank info", description: "Info" },
    { title: "Subscribe", description: "Subscribe" },
    { title: "Finalize", description: "Finalize" },
  ];
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col justify-center gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CreditCard className="size-4" />
          </div>
          Credit IQ
        </a>
        {currentStep > 0 && <HorizontalSteps steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />}
        {currentStep === 0 && <BankCreationForm setCurrentStep={setCurrentStep} />}
        {currentStep === 1 && <BankSignupForm setCurrentStep={setCurrentStep} signup={signup} />}
        {currentStep === 2 && <BankInformationForm setCurrentStep={setCurrentStep} />}
      </div>
    </div>
  );
}
