"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CoApplicantForm from "../../components/CoApplicantForm";
import { getCoApplicantById } from "@/app/saas/(private)/co-applicants/actions";
import { toast } from "@/hooks/use-toast";

export default function EditCoApplicantPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [coApplicantData, setCoApplicantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoApplicant = async () => {
      setIsLoading(true);
      try {
        const response = await getCoApplicantById(params.id);
        if (response.success) {
          setCoApplicantData(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch co-applicant details",
            variant: "destructive",
          });
          router.push("/saas/co-applicants/list");
        }
      } catch (error) {
        console.error("Error fetching co-applicant details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        router.push("/saas/co-applicants/list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoApplicant();
  }, [params.id, router]);

  const handleBack = () => {
    router.push(`/saas/co-applicants/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading co-applicant details...</p>
      </div>
    );
  }

  if (!coApplicantData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Co-applicant not found</p>
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
          <h1 className="text-2xl font-semibold tracking-tight">Edit Co-Applicant</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <CoApplicantForm initialData={coApplicantData} isEditMode={true} />
        </div>
      </div>
    </div>
  );
}
