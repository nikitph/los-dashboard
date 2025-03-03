"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import CoApplicantForm from "../components/CoApplicantForm";

export default function CreateCoApplicantPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/saas/co-applicants/list");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Add New Co-Applicant</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <CoApplicantForm />
        </div>
      </div>
    </div>
  );
}
