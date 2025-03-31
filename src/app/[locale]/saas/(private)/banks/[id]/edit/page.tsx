"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBankAction } from "../../actions";
import { useToast } from "@/hooks/use-toast";
import BankForm from "../../BankForm";

interface EditBankPageProps {
  params: {
    id: string;
  };
}

export default function EditBankPage({ params }: EditBankPageProps) {
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
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/saas/banks/${id}`)} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Bank</h1>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <BankForm bank={bank} onSuccess={() => router.push(`/saas/banks/${id}`)} />
        </div>
      </div>
    </div>
  );
}
