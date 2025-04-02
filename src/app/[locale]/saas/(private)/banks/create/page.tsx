"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import BankForm from "../BankForm";

export default function CreateBankPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/saas/banks/list")} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Bank</h1>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <BankForm />
        </div>
      </div>
    </div>
  );
}
