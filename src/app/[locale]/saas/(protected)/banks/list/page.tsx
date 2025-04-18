"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GenericTable } from "@/components/ui/generic/GenericTable";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { deleteBankAction, fetchBanksAction } from "../actions";
import { useToast } from "@/hooks/use-toast";

export default function BanksListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const result = await fetchBanksAction();
      if (result.success) {
        // @ts-ignore
        setBanks(result?.data);
      } else {
        toast({
          title: "Error fetching banks",
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

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this bank?")) {
      try {
        const result = await deleteBankAction(id);
        if (result.success) {
          toast({
            title: "Bank deleted successfully",
            variant: "default",
          });
          fetchBanks();
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

  // Filter banks based on search term
  const filteredBanks = banks.filter((bank) => bank.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Define columns for the GenericTable
  const columns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
    },
    {
      key: "createdAt",
      header: "Created At",
      formatter: (value: string) => format(new Date(value), "dd MMM yyyy"),
      sortable: true,
    },
    {
      key: "updatedAt",
      header: "Updated At",
      formatter: (value: string) => format(new Date(value), "dd MMM yyyy"),
      sortable: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Banks List</h1>
        </div>

        <div className="flex justify-between">
          <Input
            placeholder="Search banks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={() => router.push("/saas/banks/create")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Bank
          </Button>
        </div>

        {loading ? (
          <div className="py-4 text-center">Loading...</div>
        ) : (
          <div className="rounded-md border">
            <GenericTable data={filteredBanks} columns={columns} basePath="/saas/banks" onDelete={handleDelete} />
          </div>
        )}
      </div>
    </div>
  );
}
