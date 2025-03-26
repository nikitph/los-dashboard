"use client";

import { CreditCard } from "lucide-react";
import { signup } from "@/app/saas/(auth)/signup/actions";
import { useState } from "react";
import { BankCreationForm } from "@/app/saas/(auth)/banksignup/BankCreationForm";

export default function BankSignupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { title: "Create Admin", description: "Create Admin" },
    { title: "Bank info", description: "Bank-info" },
    { title: "Subscribe", description: "Subscribe" },
    { title: "Step 4", description: "Confirm and finish" },
  ];
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-xl flex-col justify-center gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CreditCard className="size-4" />
          </div>
          Credit IQ
        </a>
        {/*<HorizontalSteps steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />*/}
        <BankCreationForm signup={signup} currentStep={currentStep} />
      </div>
    </div>
  );
}
