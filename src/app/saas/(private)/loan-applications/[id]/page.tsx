"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Edit, Files, FileText, Landmark, Trash, UserCircle } from "lucide-react";
import { deleteLoanApplication, getLoanApplicationById } from "@/app/saas/(private)/loan-applications/actions";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/displayUtils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface LoanApplication {
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
  documents?: any[];
  verifications?: any[];
  guarantors?: any[];
  coApplicants?: any[];
}

export default function LoanApplicationDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loanApplication, setLoanApplication] = useState<LoanApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLoanApplication = async () => {
      setIsLoading(true);
      try {
        const response = await getLoanApplicationById(params.id);
        if (response.success) {
          setLoanApplication(response?.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch loan application details",
            variant: "destructive",
          });
          router.push("/saas/loan-applications/list");
        }
      } catch (error) {
        console.error("Error fetching loan application details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoanApplication();
  }, [params.id, router]);

  const handleBack = () => {
    router.push("/saas/loan-applications/list");
  };

  const handleEdit = () => {
    router.push(`/saas/loan-applications/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this loan application?")) {
      try {
        const response = await deleteLoanApplication(params.id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Loan application deleted successfully",
          });
          router.push("/saas/loan-applications/list");
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading loan application details...</p>
      </div>
    );
  }

  if (!loanApplication) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loan application not found</p>
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
          <h1 className="text-2xl font-semibold tracking-tight">Loan Application Details</h1>
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

      <div className="space-y-6">
        {/* Status and Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium">
                  {getLoanTypeDisplay(loanApplication.loanType)} - {loanApplication.amountRequested}
                </h2>
                <p className="text-sm text-muted-foreground">Applied on {formatDate(loanApplication.createdAt)}</p>
              </div>
              <div>{getStatusBadge(loanApplication.status)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="guarantors">Guarantors</TabsTrigger>
            <TabsTrigger value="coapplicants">Co-Applicants</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Applicant Information */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Applicant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="mt-1">
                      {loanApplication.applicant?.user?.firstName || ""}{" "}
                      {loanApplication.applicant?.user?.lastName || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1">{loanApplication.applicant?.user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="mt-1">{loanApplication.applicant?.user?.phoneNumber || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Loan Details */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Loan Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Application ID</p>
                    <p className="mt-1">{loanApplication.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Loan Type</p>
                    <p className="mt-1">{getLoanTypeDisplay(loanApplication.loanType)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount Requested</p>
                    <p className="mt-1">{loanApplication.amountRequested}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Information */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Landmark className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Bank Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bank</p>
                    <p className="mt-1">{loanApplication.bank?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bank ID</p>
                    <p className="mt-1">{loanApplication.bankId}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Application Date</p>
                    <p className="mt-1">{formatDate(loanApplication.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="mt-1">{formatDate(loanApplication.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                    <p className="mt-1">{getStatusBadge(loanApplication.status)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Files className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Document List</CardTitle>
              </CardHeader>
              <CardContent>
                {loanApplication.documents && loanApplication.documents.length > 0 ? (
                  <div className="space-y-4">
                    {loanApplication.documents.map((doc, index) => (
                      <div key={doc.id || index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{doc.documentType || `Document ${index + 1}`}</p>
                          <p className="text-sm text-muted-foreground">Uploaded on {formatDate(doc.uploadedAt)}</p>
                        </div>
                        <Badge
                          className={
                            doc.verificationStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {doc.verificationStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents attached to this loan application.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                {loanApplication.verifications && loanApplication.verifications.length > 0 ? (
                  <div className="space-y-4">
                    {loanApplication.verifications.map((verification, index) => (
                      <div key={verification.id || index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{verification.type || `Verification ${index + 1}`}</p>
                            {verification.verifiedAt && (
                              <p className="text-sm text-muted-foreground">
                                Verified on {formatDate(verification.verifiedAt)}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={
                              verification.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : verification.status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {verification.status}
                          </Badge>
                        </div>
                        {verification.notes && (
                          <p className="text-sm text-muted-foreground">Notes: {verification.notes}</p>
                        )}
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No verifications conducted for this loan application.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guarantors Tab */}
          <TabsContent value="guarantors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Guarantors</CardTitle>
              </CardHeader>
              <CardContent>
                {loanApplication.guarantors && loanApplication.guarantors.length > 0 ? (
                  <div className="space-y-6">
                    {loanApplication.guarantors.map((guarantor, index) => (
                      <div key={guarantor.id || index} className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            {guarantor.firstName} {guarantor.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{guarantor.email}</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone Number</p>
                            <p>{guarantor.mobileNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p>
                              {guarantor.addressLine1}
                              {guarantor.addressLine2 && `, ${guarantor.addressLine2}`}
                              <br />
                              {guarantor.addressCity}, {guarantor.addressState} {guarantor.addressZipCode}
                            </p>
                          </div>
                        </div>
                        {index < (loanApplication?.guarantors?.length ?? 0) - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No guarantors for this loan application.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Co-Applicants Tab */}
          <TabsContent value="coapplicants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Co-Applicants</CardTitle>
              </CardHeader>
              <CardContent>
                {loanApplication.coApplicants && loanApplication.coApplicants.length > 0 ? (
                  <div className="space-y-6">
                    {loanApplication.coApplicants.map((coApplicant, index) => (
                      <div key={coApplicant.id || index} className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            {coApplicant.firstName} {coApplicant.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{coApplicant.email}</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone Number</p>
                            <p>{coApplicant.mobileNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p>
                              {coApplicant.addressLine1}
                              {coApplicant.addressLine2 && `, ${coApplicant.addressLine2}`}
                              <br />
                              {coApplicant.addressCity}, {coApplicant.addressState} {coApplicant.addressZipCode}
                            </p>
                          </div>
                        </div>
                        {index < (loanApplication?.coApplicants?.length ?? 0) - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No guarantors for this loan application.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
