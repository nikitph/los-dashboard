"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SubscriptionForm from "../../components/SubscriptionForm";
import { getSubscriptionById } from "../../actions";
import { toast } from "@/hooks/use-toast";

export default function EditSubscriptionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      try {
        const response = await getSubscriptionById(params.id);
        if (response.success) {
          setSubscriptionData(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch subscription details",
            variant: "destructive",
          });
          router.push("/saas/subscriptions/list");
        }
      } catch (error) {
        console.error("Error fetching subscription details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        router.push("/saas/subscriptions/list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [params.id, router]);

  const handleBack = () => {
    router.push(`/saas/subscriptions/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading subscription details...</p>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Subscription not found</p>
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
          <h1 className="text-2xl font-semibold tracking-tight">Edit Subscription</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <SubscriptionForm initialData={subscriptionData} isEditMode={true} />
        </div>
      </div>
    </div>
  );
}
