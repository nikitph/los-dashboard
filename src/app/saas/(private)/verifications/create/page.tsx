"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import VerificationForm from "../components/VerificationForm";

export default function CreateVerificationPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/saas/verifications/list");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Verification</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <VerificationForm />
        </div>
      </div>
    </div>
  );
}
