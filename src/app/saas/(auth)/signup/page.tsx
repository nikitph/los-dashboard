"use client";

import { CreditCard } from "lucide-react";
import { SignupForm } from "@/components/SignupForm";
import { signup } from "@/app/saas/(auth)/signup/actions";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CreditCard className="size-4" />
          </div>
          Credit IQ
        </a>
        <SignupForm signup={signup} />
      </div>
    </div>
  );
}
