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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowUpDown, MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { deleteGuarantor, getGuarantors, getStates } from "../actions";
import { formatDate } from "@/utils/displayUtils";

interface Guarantor {
  id: string;
  loanApplicationId: string;
  firstName: string;
  lastName: string;
  email: string;
  addressState: string;
  addressCity: string;
  addressZipCode: string;
  addressLine1: string;
  addressLine2?: string;
  mobileNumber: string;
  createdAt: Date;
  updatedAt: Date;
  loanApplication?: {
    applicant?: {
      user?: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    };
  };
}

interface SortConfig {
  key: string | null;
  direction: "asc" | "desc";
}

export default function GuarantorsListPage() {
  const router = useRouter();
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [states, setStates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch guarantors with current filters and sorting
  const fetchGuarantors = async () => {
    try {
      const response = await getGuarantors(
        searchTerm,
        stateFilter,
        sortConfig.key ? { key: sortConfig.key, direction: sortConfig.direction } : undefined,
      );

      if (response.success) {
        setGuarantors(response?.data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch guarantors",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching guarantors:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Fetch guarantors and states on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch available states for filter
        const statesResponse = await getStates();
        if (statesResponse.success) {
          setStates(statesResponse.data || []);
        }

        // Fetch guarantors with current filters
        await fetchGuarantors();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load guarantors",
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
    fetchGuarantors();
  }, [searchTerm, stateFilter, sortConfig]);

  // Handle sort column click
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Handle delete guarantor
  const handleDeleteGuarantor = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this guarantor?")) {
      try {
        const response = await deleteGuarantor(id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Guarantor deleted successfully",
          });
          // Refresh the list
          fetchGuarantors();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete guarantor",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting guarantor:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Navigate to create new guarantor page
  const handleCreate = () => {
    router.push("/saas/guarantors/create");
  };

  // Navigate to view guarantor details
  const handleViewDetails = (id: string) => {
    router.push(`/saas/guarantors/${id}`);
  };

  // Navigate to edit guarantor
  const handleEditGuarantor = (id: string) => {
    router.push(`/saas/guarantors/${id}/edit`);
  };

  // Get applicant name from loan application for display
  const getApplicantName = (guarantor: Guarantor) => {
    if (!guarantor.loanApplication?.applicant?.user) return "N/A";
    const { firstName, lastName } = guarantor.loanApplication.applicant.user;
    return `${firstName || ""} ${lastName || ""}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push("/saas/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Guarantors List</h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search guarantors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Guarantor
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p>Loading guarantors...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("firstName")} className="cursor-pointer">
                    Name <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
                    Email <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("mobileNumber")} className="cursor-pointer">
                    Mobile <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                    Created At <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guarantors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No guarantors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  guarantors.map((guarantor) => (
                    <TableRow key={guarantor.id}>
                      <TableCell className="font-medium">
                        {guarantor.firstName} {guarantor.lastName}
                      </TableCell>
                      <TableCell>{guarantor.email}</TableCell>
                      <TableCell>{guarantor.mobileNumber}</TableCell>
                      <TableCell>{getApplicantName(guarantor)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{guarantor.addressLine1}</div>
                          <div className="text-sm text-muted-foreground">
                            {guarantor.addressCity}, {guarantor.addressState} - {guarantor.addressZipCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(guarantor.createdAt)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(guarantor.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditGuarantor(guarantor.id)}>
                              Edit Guarantor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteGuarantor(guarantor.id)}
                              className="text-red-600"
                            >
                              Delete Guarantor
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
