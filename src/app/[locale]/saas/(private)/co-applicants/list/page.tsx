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
import { deleteCoApplicant, getCoApplicants, getLoanApplications, getStates } from "../actions";
import { formatDate } from "@/lib/displayUtils";

interface CoApplicant {
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

export default function CoApplicantsListPage() {
  const router = useRouter();
  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [loanApplicationFilter, setLoanApplicationFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [states, setStates] = useState<string[]>([]);
  const [loanApplications, setLoanApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch co-applicants with current filters and sorting
  const fetchCoApplicants = async () => {
    try {
      const response = await getCoApplicants(
        searchTerm,
        loanApplicationFilter,
        sortConfig.key ? { key: sortConfig.key, direction: sortConfig.direction } : undefined,
      );

      if (response.success) {
        setCoApplicants(response?.data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch co-applicants",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching co-applicants:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Fetch co-applicants and states on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch available states for filter
        const statesResponse = await getStates();
        if (statesResponse.success) {
          setStates(statesResponse.data || []);
        }

        // Fetch available loan applications for filter
        const loanAppsResponse = await getLoanApplications();
        if (loanAppsResponse.success) {
          setLoanApplications(loanAppsResponse.data || []);
        }

        // Fetch co-applicants with current filters
        await fetchCoApplicants();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load co-applicants",
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
    fetchCoApplicants();
  }, [searchTerm, stateFilter, loanApplicationFilter, sortConfig]);

  // Handle sort column click
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Handle delete co-applicant
  const handleDeleteCoApplicant = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this co-applicant?")) {
      try {
        const response = await deleteCoApplicant(id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Co-applicant deleted successfully",
          });
          // Refresh the list
          fetchCoApplicants();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete co-applicant",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting co-applicant:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Navigate to create new co-applicant page
  const handleCreate = () => {
    router.push("/saas/co-applicants/create");
  };

  // Navigate to view co-applicant details
  const handleViewDetails = (id: string) => {
    router.push(`/saas/co-applicants/${id}`);
  };

  // Navigate to edit co-applicant
  const handleEditCoApplicant = (id: string) => {
    router.push(`/saas/co-applicants/${id}/edit`);
  };

  // Get applicant name from loan application for display
  const getApplicantName = (coApplicant: CoApplicant) => {
    if (!coApplicant.loanApplication?.applicant?.user) return "N/A";
    const { firstName, lastName } = coApplicant.loanApplication.applicant.user;
    return `${firstName || ""} ${lastName || ""}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push("/saas/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Co-Applicants List</h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search co-applicants..."
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
            <Select value={loanApplicationFilter} onValueChange={setLoanApplicationFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by loan application" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Loan Applications</SelectItem>
                  {loanApplications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.applicant?.user?.firstName || ""} {app.applicant?.user?.lastName || ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Co-Applicant
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p>Loading co-applicants...</p>
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
                  <TableHead>Primary Applicant</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                    Created At <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No co-applicants found.
                    </TableCell>
                  </TableRow>
                ) : (
                  coApplicants.map((coApplicant) => (
                    <TableRow key={coApplicant.id}>
                      <TableCell className="font-medium">
                        {coApplicant.firstName} {coApplicant.lastName}
                      </TableCell>
                      <TableCell>{coApplicant.email}</TableCell>
                      <TableCell>{coApplicant.mobileNumber}</TableCell>
                      <TableCell>{getApplicantName(coApplicant)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{coApplicant.addressLine1}</div>
                          <div className="text-sm text-muted-foreground">
                            {coApplicant.addressCity}, {coApplicant.addressState} - {coApplicant.addressZipCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(coApplicant.createdAt)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(coApplicant.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCoApplicant(coApplicant.id)}>
                              Edit Co-Applicant
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCoApplicant(coApplicant.id)}
                              className="text-red-600"
                            >
                              Delete Co-Applicant
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
