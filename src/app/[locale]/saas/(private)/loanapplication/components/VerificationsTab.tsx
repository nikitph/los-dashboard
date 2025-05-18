import React from "react";
import { Alert } from "@/subframe/components/Alert";
import { Button } from "@/subframe/components/Button";
import {
  BusinessVerificationCard,
  PropertyVerificationCard,
  ResidenceVerificationCard,
  VehicleVerificationCard,
  VerificationStatus,
} from "./VerificationCards";
import { useTranslations } from "next-intl";
import { LoanApplication } from "@prisma/client";

// Type definitions for the loan application data structure
interface Verification {
  id: string;
  type: string;
  status: VerificationStatus;
  remarks?: string | null;
  verificationDate?: Date;
  updatedAt: Date;
  createdAt: Date;
  residenceVerification?: ResidenceVerification | null;
  businessVerification?: BusinessVerification | null;
  propertyVerification?: PropertyVerification | null;
  vehicleVerification?: VehicleVerification | null;
}

interface ResidenceVerification {
  id: string;
  ownerFirstName: string;
  ownerLastName: string;
  residentSince?: string | null;
  residenceType: string;
  structureType: string;
  addressCity: string;
  addressLine1: string;
  addressLine2?: string | null;
  addressState: string;
  addressZipCode: string;
  locationFromMain: string;
}

interface BusinessVerification {
  id: string;
  businessName: string;
  businessType: string;
  addressCity: string;
  addressLine1: string;
  addressLine2?: string | null;
  addressState: string;
  addressZipCode: string;
  locationFromMain: string;
  contactDetails: string;
  businessExistence: boolean;
  natureOfBusiness: string;
  salesPerDay: string;
}

interface PropertyVerification {
  id: string;
  ownerFirstName: string;
  ownerLastName: string;
  structureType: string;
  addressCity: string;
  addressLine1: string;
  addressLine2?: string | null;
  addressState: string;
  addressZipCode: string;
  locationFromMain: string;
}

interface VehicleVerification {
  id: string;
  engineNumber?: string | null;
  chassisNumber?: string | null;
  registrationNumber?: string | null;
  make: string;
  model: string;
  vehicleType?: string | null;
}

interface VisibilitySettings {
  verifications: boolean;
  canAddVerification: boolean;
}

interface VerificationsTabProps {
  loanApplication: LoanApplication;
  visibility: VisibilitySettings;
  activeTabIndex: number;
}

const VerificationsTab: React.FC<VerificationsTabProps> = ({ loanApplication, visibility, activeTabIndex }) => {
  const t = useTranslations("LoanApplication");

  // Function to handle view details button click
  const handleViewDetails = (id: string) => {
    console.log(`Viewing details for verification ID: ${id}`);
    // Navigate to details page or open modal
  };

  // Function to handle adding a new verification
  const handleAddVerification = () => {
    console.log("Add verification clicked");
    // Implement add verification logic
  };

  // Function to render the appropriate verification card based on type
  const renderVerificationCard = (verification: Verification) => {
    switch (verification.type) {
      case "RESIDENCE":
        if (verification.residenceVerification) {
          return (
            <ResidenceVerificationCard
              id={verification.id}
              status={verification.status}
              updatedAt={verification.updatedAt}
              verificationDate={verification.verificationDate}
              remarks={verification.remarks}
              data={{
                ownerFirstName: verification.residenceVerification.ownerFirstName,
                ownerLastName: verification.residenceVerification.ownerLastName,
                residentSince: verification.residenceVerification.residentSince,
                residenceType: verification.residenceVerification.residenceType as any,
                structureType: verification.residenceVerification.structureType as any,
                addressLine1: verification.residenceVerification.addressLine1,
                addressLine2: verification.residenceVerification.addressLine2,
                addressCity: verification.residenceVerification.addressCity,
                addressState: verification.residenceVerification.addressState,
                addressZipCode: verification.residenceVerification.addressZipCode,
                locationFromMain: verification.residenceVerification.locationFromMain,
              }}
              onViewDetails={handleViewDetails}
              className="mb-4"
            />
          );
        }
        break;

      case "BUSINESS":
        if (verification.businessVerification) {
          return (
            <BusinessVerificationCard
              id={verification.id}
              status={verification.status}
              updatedAt={verification.updatedAt}
              verificationDate={verification.verificationDate}
              remarks={verification.remarks}
              data={{
                businessName: verification.businessVerification.businessName,
                businessType: verification.businessVerification.businessType,
                addressLine1: verification.businessVerification.addressLine1,
                addressLine2: verification.businessVerification.addressLine2,
                addressCity: verification.businessVerification.addressCity,
                addressState: verification.businessVerification.addressState,
                addressZipCode: verification.businessVerification.addressZipCode,
                locationFromMain: verification.businessVerification.locationFromMain,
                contactDetails: verification.businessVerification.contactDetails,
                businessExistence: verification.businessVerification.businessExistence,
                natureOfBusiness: verification.businessVerification.natureOfBusiness,
                salesPerDay: verification.businessVerification.salesPerDay,
              }}
              onViewDetails={handleViewDetails}
              className="mb-4"
            />
          );
        }
        break;

      case "PROPERTY":
        if (verification.propertyVerification) {
          return (
            <PropertyVerificationCard
              id={verification.id}
              status={verification.status}
              updatedAt={verification.updatedAt}
              verificationDate={verification.verificationDate}
              remarks={verification.remarks}
              data={{
                ownerFirstName: verification.propertyVerification.ownerFirstName,
                ownerLastName: verification.propertyVerification.ownerLastName,
                structureType: verification.propertyVerification.structureType,
                addressLine1: verification.propertyVerification.addressLine1,
                addressLine2: verification.propertyVerification.addressLine2,
                addressCity: verification.propertyVerification.addressCity,
                addressState: verification.propertyVerification.addressState,
                addressZipCode: verification.propertyVerification.addressZipCode,
                locationFromMain: verification.propertyVerification.locationFromMain,
              }}
              onViewDetails={handleViewDetails}
              className="mb-4"
            />
          );
        }
        break;

      case "VEHICLE":
        if (verification.vehicleVerification) {
          return (
            <VehicleVerificationCard
              id={verification.id}
              status={verification.status}
              updatedAt={verification.updatedAt}
              verificationDate={verification.verificationDate}
              remarks={verification.remarks}
              data={{
                make: verification.vehicleVerification.make,
                model: verification.vehicleVerification.model,
                vehicleType: verification.vehicleVerification.vehicleType,
                engineNumber: verification.vehicleVerification.engineNumber,
                chassisNumber: verification.vehicleVerification.chassisNumber,
                registrationNumber: verification.vehicleVerification.registrationNumber,
              }}
              onViewDetails={handleViewDetails}
              className="mb-4"
            />
          );
        }
        break;

      default:
        return null;
    }

    return (
      <div className="mb-4 w-full rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading-3 text-heading-3">{verification.type}</h3>
            <p className="text-subtext-color">{t(`verificationStatus.${verification.status}`)}</p>
            {verification.remarks && <p className="mt-2 text-body">{verification.remarks}</p>}
          </div>
        </div>
      </div>
    );
  };

  // Only render if this is the active tab and verifications are visible
  if (activeTabIndex !== 2 || !visibility.verifications) {
    return null;
  }

  return (
    <div className="w-full">
      {loanApplication.verifications && loanApplication.verifications.length > 0 ? (
        <div className="flex w-full flex-col items-start gap-4">
          {loanApplication.verifications.map((verification: Verification) => (
            <React.Fragment key={verification.id}>{renderVerificationCard(verification)}</React.Fragment>
          ))}
        </div>
      ) : (
        <Alert
          icon="FeatherInfo"
          title={t("alerts.noVerificationsTitle")}
          description={t("alerts.noVerificationsDescription")}
        />
      )}

      {visibility.canAddVerification && (
        <Button className="mt-4" icon="FeatherPlus" onClick={handleAddVerification}>
          {t("actions.addVerification")}
        </Button>
      )}
    </div>
  );
};

export default VerificationsTab;
