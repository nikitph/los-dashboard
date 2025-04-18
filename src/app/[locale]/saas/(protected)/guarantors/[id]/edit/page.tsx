"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GuarantorForm from "../../components/GuarantorForm";
import { getGuarantorById } from "@/app/[locale]/saas/(private)/guarantors/actions";
import { toast } from "@/hooks/use-toast";

export default function EditGuarantorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [guarantorData, setGuarantorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuarantor = async () => {
      setIsLoading(true);
      try {
        const response = await getGuarantorById(params.id);
        if (response.success) {
          setGuarantorData(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch guarantor details",
            variant: "destructive",
          });
          router.push("/saas/guarantors/list");
        }
      } catch (error) {
        console.error("Error fetching guarantor details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        router.push("/saas/guarantors/list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuarantor();
  }, [params.id, router]);

  const handleBack = () => {
    router.push(`/saas/guarantors/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading guarantor details...</p>
      </div>
    );
  }

  if (!guarantorData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Guarantor not found</p>
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
          <h1 className="text-2xl font-semibold tracking-tight">Edit Guarantor</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <GuarantorForm initialData={guarantorData} isEditMode={true} />
        </div>
      </div>
    </div>
  );
}
