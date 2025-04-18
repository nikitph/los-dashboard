"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { deleteApplicant, getApplicantById } from "@/app/[locale]/saas/(private)/applicants/actions";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/displayUtils";

interface Applicant {
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
  loanApplications?: any[];
}

export default function ApplicantDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplicant = async () => {
      setIsLoading(true);
      try {
        const response = await getApplicantById(params.id);
        if (response.success) {
          // @ts-ignore
          setApplicant(response?.data || []);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch applicant details",
            variant: "destructive",
          });
          router.push("/saas/applicants/list");
        }
      } catch (error) {
        console.error("Error fetching applicant details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicant();
  }, [params.id, router]);

  const handleBack = () => {
    router.push("/saas/applicants/list");
  };

  const handleEdit = () => {
    router.push(`/saas/applicants/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this applicant?")) {
      try {
        const response = await deleteApplicant(params.id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Applicant deleted successfully",
          });
          router.push("/saas/applicants/list");
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete applicant",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting applicant:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading applicant details...</p>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Applicant not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Applicant Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1">
                  {applicant.user?.firstName || ""} {applicant.user?.lastName || ""}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="mt-1">{applicant.userId}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="mt-1">{formatDate(applicant.dateOfBirth)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1">{applicant.user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="mt-1">{applicant.user?.phoneNumber || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Address</p>
              <p className="mt-1">{applicant.addressFull}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">City</p>
                <p className="mt-1">{applicant.addressCity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">State</p>
                <p className="mt-1">{applicant.addressState}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pin Code</p>
                <p className="mt-1">{applicant.addressPinCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identity Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Aadhar Number</p>
                <p className="mt-1">{applicant.aadharNumber}</p>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  applicant.aadharVerificationStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {applicant.aadharVerificationStatus ? "Verified" : "Not Verified"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">PAN Number</p>
                <p className="mt-1">{applicant.panNumber}</p>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  applicant.panVerificationStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {applicant.panVerificationStatus ? "Verified" : "Not Verified"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="mt-1">{formatDate(applicant.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Updated At</p>
                <p className="mt-1">{formatDate(applicant.updatedAt)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Loan Applications</p>
              <p className="mt-1">{applicant.loanApplications?.length || 0} applications</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
