"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LoanApplicationForm from "../../components/LoanApplicationForm";
import { getLoanApplicationById } from "@/app/saas/(private)/loan-applications/actions";
import { toast } from "@/hooks/use-toast";

export default function EditLoanApplicationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loanApplicationData, setLoanApplicationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLoanApplication = async () => {
      setIsLoading(true);
      try {
        const response = await getLoanApplicationById(params.id);
        if (response.success) {
          setLoanApplicationData(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch loan application details",
            variant: "destructive",
          });
          router.push("/saas/loan-applications/list");
        }
      } catch (error) {
        console.error("Error fetching loan application details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        router.push("/saas/loan-applications/list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoanApplication();
  }, [params.id, router]);

  const handleBack = () => {
    router.push(`/saas/loan-applications/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading loan application details...</p>
      </div>
    );
  }

  if (!loanApplicationData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loan application not found</p>
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
          <h1 className="text-2xl font-semibold tracking-tight">Edit Loan Application</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <LoanApplicationForm initialData={loanApplicationData} isEditMode={true} />
        </div>
      </div>
    </div>
  );
}
