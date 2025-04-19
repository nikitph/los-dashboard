"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowUpDown, MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { deleteSubscription, getSubscriptions } from "../actions";
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

interface SortConfig {
  key: string | null;
  direction: "asc" | "desc";
}

export default function SubscriptionsListPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subscriptions with current filters and sorting
  const fetchSubscriptions = async () => {
    try {
      const response = await getSubscriptions(
        searchTerm,
        {},
        sortConfig.key ? { key: sortConfig.key, direction: sortConfig.direction } : undefined,
      );

      if (response.success) {
        setSubscriptions(response?.data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch subscriptions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Fetch subscriptions on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchSubscriptions();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load subscriptions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle filtering whenever filters change
  useEffect(() => {
    fetchSubscriptions();
  }, [searchTerm, sortConfig]);

  // Handle sort column click
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Handle delete subscription
  const handleDeleteSubscription = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        const response = await deleteSubscription(id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Subscription deleted successfully",
          });
          // Refresh the list
          fetchSubscriptions();
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

  // Navigate to create new subscription page
  const handleCreate = () => {
    router.push("/saas/subscriptions/create");
  };

  // Navigate to view subscription details
  const handleViewDetails = (id: string) => {
    router.push(`/saas/subscriptions/${id}`);
  };

  // Navigate to edit subscription
  const handleEditSubscription = (id: string) => {
    router.push(`/saas/subscriptions/${id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push("/saas/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {/* Add additional filters here if needed */}
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p>Loading subscriptions...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("bankId")} className="cursor-pointer">
                    Bank Id <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("startDate")} className="cursor-pointer">
                    Start Date <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("endDate")} className="cursor-pointer">
                    End Date <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                    Status <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                    Created At <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>{subscription.bankId}</TableCell>
                      <TableCell>{formatDate(subscription.startDate)}</TableCell>
                      <TableCell>{formatDate(subscription?.endDate)}</TableCell>
                      <TableCell>{subscription.status}</TableCell>
                      <TableCell>{formatDate(subscription.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(subscription.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditSubscription(subscription.id)}>
                              Edit Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteSubscription(subscription.id)}
                              className="text-red-600"
                            >
                              Delete Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
