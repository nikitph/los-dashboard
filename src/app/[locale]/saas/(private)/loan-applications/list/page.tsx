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
import { deleteLoanApplication, getLoanApplications, getLoanTypes } from "../actions";
import { formatDate } from "@/utils/displayUtils";
import { Badge } from "@/components/ui/badge";

type LoanApplication = {
  id: string;
  applicantId: string;
  bankId: string;
  loanType: string;
  amountRequested: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  applicant?: {
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
    };
  };
  bank?: {
    name: string;
  };
};

type SortConfig = {
  key: keyof LoanApplication | null;
  direction: "asc" | "desc";
};

export default function LoanApplicationsListPage() {
  const router = useRouter();
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [loanTypes, setLoanTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch loan applications and loan types on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch available loan types for filter
        const typesResponse = await getLoanTypes();
        if (typesResponse.success) {
          setLoanTypes(typesResponse.data || []);
        }

        // Fetch loan applications with current filters
        await fetchLoanApplications();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load loan applications",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch loan applications with current filters and sorting
  const fetchLoanApplications = async () => {
    try {
      const response = await getLoanApplications(
        searchTerm,
        statusFilter,
        typeFilter,
        sortConfig.key ? { key: sortConfig.key as string, direction: sortConfig.direction } : undefined,
      );

      if (response.success) {
        setLoanApplications(response.data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch loan applications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching loan applications:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle filtering whenever filters change
  useEffect(() => {
    fetchLoanApplications();
  }, [searchTerm, statusFilter, typeFilter, sortConfig]);

  // Handle sort column click
  const handleSort = (key: keyof LoanApplication) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Handle delete loan application
  const handleDeleteLoanApplication = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this loan application?")) {
      try {
        const response = await deleteLoanApplication(id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Loan application deleted successfully",
          });
          // Refresh the list
          fetchLoanApplications();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete loan application",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting loan application:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Navigate to create new loan application page
  const handleCreate = () => {
    router.push("/saas/loan-applications/create");
  };

  // Navigate to view loan application details
  const handleViewDetails = (id: string) => {
    router.push(`/saas/loan-applications/${id}`);
  };

  // Navigate to edit loan application
  const handleEditLoanApplication = (id: string) => {
    router.push(`/saas/loan-applications/${id}/edit`);
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "UNDER_REVIEW":
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case "PENDING":
      default:
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
    }
  };

  // Get loan type display name
  const getLoanTypeDisplay = (type: string) => {
    switch (type) {
      case "PERSONAL":
        return "Personal Loan";
      case "VEHICLE":
        return "Vehicle Loan";
      case "HOUSE_CONSTRUCTION":
        return "House Construction";
      case "PLOT_PURCHASE":
        return "Plot Purchase";
      case "MORTGAGE":
        return "Mortgage";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push("/saas/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Loan Applications</h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Types</SelectItem>
                  {loanTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getLoanTypeDisplay(type)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p>Loading loan applications...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("applicantId")} className="cursor-pointer">
                    Applicant <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("loanType")} className="cursor-pointer">
                    Loan Type <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("amountRequested")} className="cursor-pointer">
                    Amount <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                    Status <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                    Application Date <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No loan applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  loanApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.applicant?.user?.firstName || ""} {application.applicant?.user?.lastName || ""}
                        <div className="text-xs text-muted-foreground">{application.applicant?.user?.email || ""}</div>
                      </TableCell>
                      <TableCell>{getLoanTypeDisplay(application.loanType)}</TableCell>
                      <TableCell>{application.amountRequested}</TableCell>
                      <TableCell>{application.bank?.name || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>{formatDate(application.createdAt)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(application.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditLoanApplication(application.id)}>
                              Edit Application
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteLoanApplication(application.id)}
                              className="text-red-600"
                            >
                              Delete Application
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
