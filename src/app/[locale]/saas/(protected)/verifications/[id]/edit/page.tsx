"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import VerificationForm from "../../components/VerificationForm";
import { getVerificationById } from "@/app/[locale]/saas/(private)/verifications/actions";
import { toast } from "@/hooks/use-toast";

export default function EditVerificationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVerification = async () => {
      setIsLoading(true);
      try {
        const response = await getVerificationById(params.id);
        if (response.success) {
          setVerificationData(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch verification details",
            variant: "destructive",
          });
          router.push("/saas/verifications/list");
        }
      } catch (error) {
        console.error("Error fetching verification details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        router.push("/saas/verifications/list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerification();
  }, [params.id, router]);

  const handleBack = () => {
    router.push(`/saas/verifications/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading verification details...</p>
      </div>
    );
  }

  if (!verificationData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verification not found</p>
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
          <h1 className="text-2xl font-semibold tracking-tight">Edit Verification</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <VerificationForm initialData={verificationData} isEditMode={true} />
        </div>
      </div>
    </div>
  );
}
