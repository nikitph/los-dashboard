"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { deleteBankAction, getBankAction } from "../actions";
import { useToast } from "@/hooks/use-toast";

interface BankPageProps {
  params: {
    id: string;
  };
}

export default function BankDetailPage({ params }: BankPageProps) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [bank, setBank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBank = async () => {
      setLoading(true);
      try {
        const result = await getBankAction(id);
        if (result.success) {
          setBank(result.data);
        } else {
          toast({
            title: "Error fetching bank",
            description: result.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBank();
  }, [id]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this bank?")) {
      try {
        const result = await deleteBankAction(id);
        if (result.success) {
          toast({
            title: "Bank deleted successfully",
            variant: "default",
          });
          router.push("/saas/banks/list");
        } else {
          toast({
            title: "Error deleting bank",
            description: result.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="py-4 text-center">Loading...</div>
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="py-4 text-center">Bank not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/saas/banks/list")} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">Bank Details</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/saas/banks/${id}/edit`)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bank Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">ID</p>
              <p>{bank.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p>{bank.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p>{format(new Date(bank.createdAt), "MMMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p>{format(new Date(bank.updatedAt), "MMMM d, yyyy")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Add more cards here for related data if needed */}
      </div>
    </div>
  );
}
