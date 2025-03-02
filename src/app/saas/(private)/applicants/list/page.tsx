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
import { ArrowLeft, ArrowUpDown, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { deleteApplicant, getApplicants, getStates } from "../actions";
import { formatDate } from "@/utils/displayUtils";

// Define type for applicants data
type Applicant = {
  id: string;
  userId: string;
  dateOfBirth: Date;
  addressState: string;
  addressCity: string;
  addressFull: string;
  addressPinCode: string;
  aadharNumber: string;
  panNumber: string;
  aadharVerificationStatus: boolean;
  panVerificationStatus: boolean;
  photoUrl: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
};

// Define type for sort configuration
type SortConfig = {
  key: keyof Applicant | null;
  direction: "asc" | "desc";
};

export default function ApplicantsListPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [states, setStates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch applicants and states on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch available states for filter
        const statesResponse = await getStates();
        if (statesResponse.success) {
          setStates(statesResponse.data || []);
        }

        // Fetch applicants with current filters
        await fetchApplicants();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load applicants",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch applicants with current filters and sorting
  const fetchApplicants = async () => {
    try {
      const response = await getApplicants(
        searchTerm,
        stateFilter,
        verificationFilter,
        sortConfig.key ? { key: sortConfig.key as string, direction: sortConfig.direction } : undefined,
      );

      if (response.success) {
        // @ts-ignore
        setApplicants(response?.data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch applicants",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle filtering whenever filters change
  useEffect(() => {
    fetchApplicants();
  }, [searchTerm, stateFilter, verificationFilter, sortConfig]);

  // Handle sort column click
  const handleSort = (key: keyof Applicant) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Handle delete applicants
  const handleDeleteApplicant = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this applicants?")) {
      try {
        const response = await deleteApplicant(id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Applicant deleted successfully",
          });
          // Refresh the list
          fetchApplicants();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete applicants",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting applicants:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Navigate to create new applicants page
  const handleCreate = () => {
    router.push("/saas/applicants/create");
  };

  // Navigate to view applicants details
  const handleViewDetails = (id: string) => {
    router.push(`/saas/applicants/${id}`);
  };

  // Navigate to edit applicants
  const handleEditApplicant = (id: string) => {
    router.push(`/saas/applicants/${id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push("/saas/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Applicants List</h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <Input
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
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
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Verification status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Applicant
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p>Loading applicants...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("userId")} className="cursor-pointer">
                    User ID <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("dateOfBirth")} className="cursor-pointer">
                    Date of Birth <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                    Created At <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No applicants found.
                    </TableCell>
                  </TableRow>
                ) : (
                  applicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">
                        {applicant.user?.firstName || ""} {applicant.user?.lastName || ""}
                        <div className="text-xs text-muted-foreground">{applicant.userId}</div>
                      </TableCell>
                      <TableCell>{formatDate(applicant.dateOfBirth)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{applicant.addressFull}</div>
                          <div className="text-sm text-muted-foreground">
                            {applicant.addressCity}, {applicant.addressState} - {applicant.addressPinCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                applicant.aadharVerificationStatus ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            Aadhar: {applicant.aadharNumber}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                applicant.panVerificationStatus ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            PAN: {applicant.panNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(applicant.createdAt)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(applicant.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditApplicant(applicant.id)}>
                              Edit Applicant
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteApplicant(applicant.id)}
                              className="text-red-600"
                            >
                              Delete Applicant
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
