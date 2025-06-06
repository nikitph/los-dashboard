"use client";

import { useState } from "react";
import { BankCreationForm } from "@/app/[locale]/saas/(auth)/banksignup/components/BankCreationForm";
import { HorizontalSteps } from "@/components/HorizontalSteps";
import { BankSignupForm } from "@/app/[locale]/saas/(auth)/banksignup/components/BankSignupForm";
import { signup } from "@/app/[locale]/saas/(auth)/banksignup/actions";
import { BankInformationForm } from "@/app/[locale]/saas/(auth)/banksignup/components/BankInformationForm";
import { Bank } from "@prisma/client";
import BankSubscriptionForm from "@/app/[locale]/saas/(auth)/banksignup/components/BankSubscriptionForm";
import { FullLogo } from "../../../../../../public/FullLogo";

export default function BankSignupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [bank, setBank] = useState<Bank | null>(null);
  const steps = [
    { title: "Create Bank", description: "Create Bank" },
    { title: "Admin", description: "Admin" },
    { title: "Bank info", description: "Info" },
    { title: "Subscribe", description: "Subscribe" },
  ];
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col justify-center gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex max-w-[180px] items-center justify-center rounded-md text-primary-foreground">
            <FullLogo />
          </div>
        </a>
        {currentStep > 0 && <HorizontalSteps steps={steps} currentStep={currentStep} onStepChange={setCurrentStep} />}
        {currentStep === 0 && <BankCreationForm setCurrentStep={setCurrentStep} setBank={setBank} />}
        {currentStep === 1 && <BankSignupForm setCurrentStep={setCurrentStep} signup={signup} bankId={bank?.id} />}
        {currentStep === 2 && bank && <BankInformationForm bankId={bank.id} setCurrentStep={setCurrentStep} />}
        {currentStep === 3 && bank && <BankSubscriptionForm bankId={bank.id} />}
      </div>
    </div>
  );
}
