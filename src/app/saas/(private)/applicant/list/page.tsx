"use client";

import { useState } from "react";
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
import { ArrowLeft, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
// Dummy data based on the schema
const applicants = [
  {
    id: "uuid-1",
    userId: "user-1",
    dateOfBirth: new Date("1990-01-01"),
    addressState: "Maharashtra",
    addressCity: "Mumbai",
    addressFull: "123 Main Street, Andheri West",
    addressPinCode: "400053",
    aadharNumber: "1234-5678-9012",
    panNumber: "ABCDE1234F",
    aadharVerificationStatus: true,
    panVerificationStatus: false,
    photoUrl: "https://example.com/photo1.jpg",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "uuid-2",
    userId: "user-2",
    dateOfBirth: new Date("1995-05-15"),
    addressState: "Karnataka",
    addressCity: "Bangalore",
    addressFull: "456 Tech Park, Whitefield",
    addressPinCode: "560066",
    aadharNumber: "9876-5432-1098",
    panNumber: "FGHIJ5678K",
    aadharVerificationStatus: true,
    panVerificationStatus: true,
    photoUrl: "https://example.com/photo2.jpg",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-02"),
  },
  // Add more dummy data as needed
];
type SortConfig = {
  key: keyof (typeof applicants)[0] | null;
  direction: "asc" | "desc";
};
const ApplicantsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  // Filter function
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch = Object.values(applicant).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const matchesState = stateFilter === "all" ? true : applicant.addressState === stateFilter;
    const matchesVerification =
      verificationFilter === "all"
        ? true
        : (verificationFilter === "verified" &&
            applicant.aadharVerificationStatus &&
            applicant.panVerificationStatus) ||
          (verificationFilter === "unverified" &&
            (!applicant.aadharVerificationStatus || !applicant.panVerificationStatus));

    return matchesSearch && matchesState && matchesVerification;
  });
  // Sort function
  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
  const handleSort = (key: keyof (typeof applicants)[0]) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0">
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
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
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
        </div>
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
              {sortedApplicants.map((applicant) => (
                <TableRow key={applicant.id}>
                  <TableCell className="font-medium">{applicant.userId}</TableCell>
                  <TableCell>{format(applicant.dateOfBirth, "dd MMM yyyy")}</TableCell>
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
                  <TableCell>{format(applicant.createdAt, "dd MMM yyyy")}</TableCell>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Applicant</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete Applicant</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
export default ApplicantsTable;
