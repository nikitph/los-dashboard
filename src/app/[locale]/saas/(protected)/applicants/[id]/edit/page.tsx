"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ApplicantForm from "../../components/ApplicantForm";
import { getApplicantById } from "@/app/[locale]/saas/(private)/applicants/actions";
import { toast } from "@/hooks/use-toast";

export default function EditApplicantPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [applicantData, setApplicantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplicant = async () => {
      setIsLoading(true);
      try {
        const response = await getApplicantById(params.id);
        if (response.success) {
          // Process dates to ensure they are properly formatted for the form
          const applicant = response.data;
          if (applicant?.dateOfBirth) {
            applicant.dateOfBirth = new Date(applicant.dateOfBirth);
          }
          setApplicantData(applicant);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch applicant details",
            variant: "destructive",
          });
          router.push("/saas/applicants/list");
        }
      } catch (error) {
        console.error("Error fetching applicant details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        router.push("/saas/applicants/list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicant();
  }, [params.id, router]);

  const handleBack = () => {
    router.push(`/saas/applicants/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading applicant details...</p>
      </div>
    );
  }

  if (!applicantData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Applicant not found</p>
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
          <h1 className="text-2xl font-semibold tracking-tight">Edit Applicant</h1>
        </div>

        <div className="rounded-lg bg-white shadow">
          <ApplicantForm initialData={applicantData} isEditMode={true} />
        </div>
      </div>
    </div>
  );
}
