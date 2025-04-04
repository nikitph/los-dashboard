"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useUser } from "@/contexts/userContext"; // Example user context
import UserForm from "../components/UserForm";
import { useFormTranslation } from "@/hooks/useFormTranslation"; // Adjust path as needed

export default function CreateUserPage() {
  const router = useRouter();
  const { page, validation, buttons, errors, toast: toastMessages, locale } = useFormTranslation("UserCreateForm");
  const { user, loading } = useUser();
  // If needed, fetch bankId from the user context, or from a route param.
  const [bankId, setBankId] = useState<string>("");

  useEffect(() => {
    if (user && user.currentRole.bankId) {
      setBankId(user.currentRole.bankId);
    }
  }, [user]);

  const handleBack = () => {
    router.push(`/${locale}/saas/users/list`); // Adjust to your user listing route
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{page("title")}</h1>
        </div>

        <div>
          <UserForm bankId={bankId} />
        </div>
      </div>
    </div>
  );
}
