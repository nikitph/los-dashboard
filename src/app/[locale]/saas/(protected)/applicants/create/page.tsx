"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ApplicantForm from "../components/ApplicantForm";
import { useUser } from "@/contexts/userContext";

export default function CreateApplicantPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [userId, setUserId] = useState<string>("");

  console.log("user", user);

  useEffect(() => {
    // Set the user ID when the user data is loaded
    if (user && user.id) {
      setUserId(user.id);
    }
  }, [user]);

  const handleBack = () => {
    router.push("/saas/applicants/list");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Applicant</h1>
        </div>

        <div className="rounded-lg bg-white shadow">
          <ApplicantForm userId={userId} />
        </div>
      </div>
    </div>
  );
}
