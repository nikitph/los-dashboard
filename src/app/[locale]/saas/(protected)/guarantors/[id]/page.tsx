// Detail page for Guarantor
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Mail, MapPin, Phone, Trash, User } from "lucide-react";
import { deleteGuarantor, getGuarantorById } from "@/app/[locale]/saas/(private)/guarantors/actions";
import { toast } from "@/hooks/use-toast";
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
    id: string;
    status: string;
    applicant?: {
      id: string;
      user?: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    };
  };
}

export default function GuarantorDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [guarantor, setGuarantor] = useState<Guarantor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuarantor = async () => {
      setIsLoading(true);
      try {
        const response = await getGuarantorById(params.id);
        if (response.success) {
          setGuarantor(response?.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch guarantor details",
            variant: "destructive",
          });
          router.push("/saas/guarantors/list");
        }
      } catch (error) {
        console.error("Error fetching guarantor details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuarantor();
  }, [params.id, router]);

  const handleBack = () => {
    router.push("/saas/guarantors/list");
  };

  const handleEdit = () => {
    router.push(`/saas/guarantors/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this guarantor?")) {
      try {
        const response = await deleteGuarantor(params.id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Guarantor deleted successfully",
          });
          router.push("/saas/guarantors/list");
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

  // Get applicant name from loan application
  const getApplicantName = () => {
    if (!guarantor?.loanApplication?.applicant?.user) return "N/A";
    const { firstName, lastName } = guarantor.loanApplication.applicant.user;
    return `${firstName || ""} ${lastName || ""}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading guarantor details...</p>
      </div>
    );
  }

  if (!guarantor) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Guarantor not found</p>
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
          <h1 className="text-2xl font-semibold tracking-tight">Guarantor Details</h1>
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
        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="mt-1 text-lg">
                {guarantor.firstName} {guarantor.lastName}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{guarantor.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{guarantor.mobileNumber}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Address Line 1</p>
              <p className="mt-1">{guarantor.addressLine1}</p>
            </div>
            {guarantor.addressLine2 && (
              <div>
                <p className="text-sm font-medium text-gray-500">Address Line 2</p>
                <p className="mt-1">{guarantor.addressLine2}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">City</p>
                <p className="mt-1">{guarantor.addressCity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">State</p>
                <p className="mt-1">{guarantor.addressState}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Zip Code</p>
                <p className="mt-1">{guarantor.addressZipCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Associated Loan Application */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <CardTitle>Associated Loan Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Loan Application ID</p>
                <p className="mt-1 break-all">{guarantor.loanApplicationId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Applicant Name</p>
                <p className="mt-1">{getApplicantName()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Loan Status</p>
                <p className="mt-1 capitalize">{guarantor.loanApplication?.status?.toLowerCase() || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Action</p>
                <p className="mt-1">
                  <Button
                    variant="link"
                    onClick={() => router.push(`/saas/loan-applications/${guarantor.loanApplicationId}`)}
                    className="h-auto p-0 text-blue-600"
                  >
                    View Loan Application
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Information */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              className="text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1">{formatDate(guarantor.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="mt-1">{formatDate(guarantor.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
