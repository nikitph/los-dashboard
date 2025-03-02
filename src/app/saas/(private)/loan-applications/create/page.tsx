"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import LoanApplicationForm from "../components/LoanApplicationForm";

export default function CreateLoanApplicationPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/saas/loan-applications/list");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Loan Application</h1>
        </div>

        <div className="rounded-lg bg-white">
          <LoanApplicationForm />
        </div>
      </div>
    </div>
  );
}
