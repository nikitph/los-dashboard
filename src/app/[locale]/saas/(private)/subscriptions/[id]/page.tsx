"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { deleteSubscription, getSubscriptionById } from "../actions";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/displayUtils";

interface Subscription {
  id: string;
  bankId: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
  amount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function SubscriptionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      try {
        const response = await getSubscriptionById(params.id);
        if (response.success) {
          setSubscription(response?.data);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [params.id, router]);

  const handleBack = () => {
    router.push("/saas/subscriptions/list");
  };

  const handleEdit = () => {
    router.push(`/saas/subscriptions/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        const response = await deleteSubscription(params.id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Subscription deleted successfully",
          });
          router.push("/saas/subscriptions/list");
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete subscription",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting subscription:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading subscription details...</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Subscription not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Subscription Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Bank Id</p>
              <p className="mt-1">{subscription.bankId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="mt-1">{formatDate(subscription.startDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">End Date</p>
              <p className="mt-1">{formatDate(subscription?.endDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="mt-1">{subscription.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Amount</p>
              <p className="mt-1">{subscription.amount}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1">{formatDate(subscription.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="mt-1">{formatDate(subscription.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
