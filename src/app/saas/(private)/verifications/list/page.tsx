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
import { deleteVerification, getVerifications } from "../actions";
import { formatDate } from "@/utils/displayUtils";
import { Badge } from "@/components/ui/badge";

type Verification = {
  id: string;
  loanApplicationId: string;
  type: string;
  status: string;
  verificationDate: Date;
  verificationTime: string;
  result: boolean;
  remarks?: string;
  verifiedById?: string;
  verifiedAt?: Date;
  addressState?: string;
  addressCity?: string;
  addressZipCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  locationFromMain?: string;
  photographUrl?: string;
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
  verifiedBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  residenceVerification?: any;
  businessVerification?: any;
  propertyVerification?: any;
  vehicleVerification?: any;
};

type SortConfig = {
  key: string | null;
  direction: "asc" | "desc";
};

export default function VerificationsListPage() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch verifications with current filters and sorting
  const fetchVerifications = async () => {
    try {
      const response = await getVerifications(
        searchTerm,
        typeFilter,
        statusFilter,
        sortConfig.key ? { key: sortConfig.key, direction: sortConfig.direction } : undefined,
      );

      if (response.success) {
        setVerifications(response?.data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch verifications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Fetch verifications on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchVerifications();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load verifications",
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
    fetchVerifications();
  }, [searchTerm, typeFilter, statusFilter, sortConfig]);

  // Handle sort column click
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Handle delete verification
  const handleDeleteVerification = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this verification?")) {
      try {
        const response = await deleteVerification(id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Verification deleted successfully",
          });
          // Refresh the list
          fetchVerifications();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete verification",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting verification:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Navigate to create new verification page
  const handleCreate = () => {
    router.push("/saas/verifications/create");
  };

  // Navigate to view verification details
  const handleViewDetails = (id: string) => {
    router.push(`/saas/verifications/${id}`);
  };

  // Navigate to edit verification
  const handleEditVerification = (id: string) => {
    router.push(`/saas/verifications/${id}/edit`);
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "PENDING":
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Get verification type display name
  const getVerificationTypeDisplay = (type: string) => {
    switch (type) {
      case "RESIDENCE":
        return "Residence";
      case "BUSINESS":
        return "Business";
      case "PROPERTY":
        return "Property";
      case "VEHICLE":
        return "Vehicle";
      default:
        return type;
    }
  };

  // Get applicant name
  const getApplicantName = (verification: Verification) => {
    if (!verification.loanApplication?.applicant?.user) return "N/A";
    const { firstName, lastName } = verification.loanApplication.applicant.user;
    return `${firstName || ""} ${lastName || ""}`;
  };

  // Get verified by officer name
  const getVerifiedByName = (verification: Verification) => {
    if (!verification.verifiedBy) return "N/A";
    const { firstName, lastName } = verification.verifiedBy;
    return `${firstName || ""} ${lastName || ""}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push("/saas/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Verifications</h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search verifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="RESIDENCE">Residence</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="PROPERTY">Property</SelectItem>
                  <SelectItem value="VEHICLE">Vehicle</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Verification
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p>Loading verifications...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("type")} className="cursor-pointer">
                    Type <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                    Status <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead onClick={() => handleSort("verificationDate")} className="cursor-pointer">
                    Verification Date <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No verifications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  verifications.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell>{getVerificationTypeDisplay(verification.type)}</TableCell>
                      <TableCell>{getStatusBadge(verification.status)}</TableCell>
                      <TableCell>{getApplicantName(verification)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{verification.addressLine1}</div>
                          {verification.addressLine2 && <div>{verification.addressLine2}</div>}
                          <div className="text-sm text-muted-foreground">
                            {verification.addressCity}, {verification.addressState} {verification.addressZipCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="whitespace-nowrap">{formatDate(verification.verificationDate)}</div>
                        <div className="text-sm text-muted-foreground">{verification.verificationTime}</div>
                      </TableCell>
                      <TableCell>{getVerifiedByName(verification)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(verification.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditVerification(verification.id)}>
                              Edit Verification
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteVerification(verification.id)}
                              className="text-red-600"
                            >
                              Delete Verification
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
