"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building, Car, Edit, FileText, Home, MapPin, Trash, User } from "lucide-react";
import { deleteVerification, getVerificationById } from "@/app/saas/(private)/verifications/actions";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/displayUtils";

export default function VerificationDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [verification, setVerification] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { downloadDocument } = useDocuments();

  useEffect(() => {
    const fetchVerification = async () => {
      setIsLoading(true);
      try {
        const response = await getVerificationById(params.id);
        if (response.success) {
          setVerification(response?.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch verification details",
            variant: "destructive",
          });
          router.push("/saas/verifications/list");
        }
      } catch (error) {
        console.error("Error fetching verification details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerification();
  }, [params.id, router]);

  const handleBack = () => {
    router.push("/saas/verifications/list");
  };

  const handleEdit = () => {
    router.push(`/saas/verifications/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this verification?")) {
      try {
        const response = await deleteVerification(params.id);

        if (response.success) {
          toast({
            title: "Success",
            description: "Verification deleted successfully",
          });
          router.push("/saas/verifications/list");
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

  // Get verification type icon and display name
  const getVerificationTypeInfo = (type: string) => {
    switch (type) {
      case "RESIDENCE":
        return { icon: <Home className="h-5 w-5 text-muted-foreground" />, name: "Residence Verification" };
      case "BUSINESS":
        return { icon: <Building className="h-5 w-5 text-muted-foreground" />, name: "Business Verification" };
      case "PROPERTY":
        return { icon: <MapPin className="h-5 w-5 text-muted-foreground" />, name: "Property Verification" };
      case "VEHICLE":
        return { icon: <Car className="h-5 w-5 text-muted-foreground" />, name: "Vehicle Verification" };
      default:
        return { icon: <FileText className="h-5 w-5 text-muted-foreground" />, name: "Verification" };
    }
  };

  // Get applicant name from loan application
  const getApplicantName = () => {
    if (!verification?.loanApplication?.applicant?.user) return "N/A";
    const { firstName, lastName } = verification.loanApplication.applicant.user;
    return `${firstName || ""} ${lastName || ""}`;
  };

  // Get verified by officer name
  const getVerifiedByName = () => {
    if (!verification?.verifiedBy) return "N/A";
    const { firstName, lastName } = verification.verifiedBy;
    return `${firstName || ""} ${lastName || ""}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading verification details...</p>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verification not found</p>
      </div>
    );
  }

  const typeInfo = getVerificationTypeInfo(verification.type);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{typeInfo.name} Details</h1>
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
        {/* Status Card */}
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-2">
              {typeInfo.icon}
              <span className="font-medium">{typeInfo.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(verification.status)}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground">Result</span>
                <Badge className={verification.result ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {verification.result ? "Passed" : "Failed"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Verification Information */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Verification Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Verification Date</p>
                <p className="mt-1">
                  {formatDate(verification.verificationDate)} at {verification.verificationTime}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Verified By</p>
                <p className="mt-1">{getVerifiedByName()}</p>
              </div>
              {verification.verifiedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Verified At</p>
                  <p className="mt-1">{formatDate(verification.verifiedAt)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Remarks</p>
                <p className="mt-1">{verification.remarks || "No remarks provided"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Applicant Information */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Applicant Name</p>
                <p className="mt-1">{getApplicantName()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Loan Application ID</p>
                <p className="mt-1 font-mono text-sm">{verification.loanApplicationId}</p>
              </div>
              <div>
                <Button
                  variant="link"
                  onClick={() => router.push(`/saas/loan-applications/${verification.loanApplicationId}`)}
                  className="px-0 text-blue-600"
                >
                  View Loan Application
                </Button>
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
              {verification.addressLine1 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Address Line 1</p>
                  <p className="mt-1">{verification.addressLine1}</p>
                </div>
              )}
              {verification.addressLine2 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Address Line 2</p>
                  <p className="mt-1">{verification.addressLine2}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="mt-1">{verification.addressCity || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">State</p>
                  <p className="mt-1">{verification.addressState || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Zip Code</p>
                  <p className="mt-1">{verification.addressZipCode || "N/A"}</p>
                </div>
              </div>
              {verification.locationFromMain && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Location from Main Road</p>
                  <p className="mt-1">{verification.locationFromMain}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Type-Specific Information */}
          {verification.type === "RESIDENCE" && verification.residenceVerification && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Home className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Residence Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {verification.residenceVerification.ownerFirstName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Owner Name</p>
                    <p className="mt-1">
                      {verification.residenceVerification.ownerFirstName}{" "}
                      {verification.residenceVerification.ownerLastName}
                    </p>
                  </div>
                )}
                {verification.residenceVerification.residentSince && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Resident Since</p>
                    <p className="mt-1">{verification.residenceVerification.residentSince}</p>
                  </div>
                )}
                {verification.residenceVerification.residenceType && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Residence Type</p>
                    <p className="mt-1">{verification.residenceVerification.residenceType}</p>
                  </div>
                )}
                {verification.residenceVerification.structureType && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Structure Type</p>
                    <p className="mt-1">{verification.residenceVerification.structureType}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {verification.type === "BUSINESS" && verification.businessVerification && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {verification.businessVerification.businessName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business Name</p>
                    <p className="mt-1">{verification.businessVerification.businessName}</p>
                  </div>
                )}
                {verification.businessVerification.businessType && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business Type</p>
                    <p className="mt-1">{verification.businessVerification.businessType}</p>
                  </div>
                )}
                {verification.businessVerification.natureOfBusiness && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nature of Business</p>
                    <p className="mt-1">{verification.businessVerification.natureOfBusiness}</p>
                  </div>
                )}
                {verification.businessVerification.contactDetails && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Details</p>
                    <p className="mt-1">{verification.businessVerification.contactDetails}</p>
                  </div>
                )}
                {verification.businessVerification.salesPerDay && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sales Per Day</p>
                    <p className="mt-1">{verification.businessVerification.salesPerDay}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Business Existence Confirmed</p>
                  <p className="mt-1">{verification.businessVerification.businessExistence ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {verification.type === "PROPERTY" && verification.propertyVerification && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {verification.propertyVerification.ownerFirstName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Owner Name</p>
                    <p className="mt-1">
                      {verification.propertyVerification.ownerFirstName}{" "}
                      {verification.propertyVerification.ownerLastName}
                    </p>
                  </div>
                )}
                {verification.propertyVerification.structureType && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Structure Type</p>
                    <p className="mt-1">{verification.propertyVerification.structureType}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {verification.type === "VEHICLE" && verification.vehicleVerification && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Car className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {verification.vehicleVerification.make && verification.vehicleVerification.model && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle</p>
                    <p className="mt-1">
                      {verification.vehicleVerification.make} {verification.vehicleVerification.model}
                    </p>
                  </div>
                )}
                {verification.vehicleVerification.vehicleType && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle Type</p>
                    <p className="mt-1">{verification.vehicleVerification.vehicleType}</p>
                  </div>
                )}
                {verification.vehicleVerification.engineNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Engine Number</p>
                    <p className="mt-1 font-mono text-sm">{verification.vehicleVerification.engineNumber}</p>
                  </div>
                )}
                {verification.vehicleVerification.chassisNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Chassis Number</p>
                    <p className="mt-1 font-mono text-sm">{verification.vehicleVerification.chassisNumber}</p>
                  </div>
                )}
                {verification.vehicleVerification.registrationNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registration Number</p>
                    <p className="mt-1 font-mono text-sm">{verification.vehicleVerification.registrationNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1">{formatDate(verification.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="mt-1">{formatDate(verification.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Photo section if available */}
        {/* Verification Photos Section */}
        {verification.documents && verification.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Verification Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {verification.documents
                  .filter((doc) => doc.documentType === "VERIFICATION_PHOTO")
                  .map((doc, index) => (
                    <VerificationPhoto key={doc.id} document={doc} index={index} />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
