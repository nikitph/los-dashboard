import React from "react";
import { IconWithBackground } from "@/subframe/components/IconWithBackground";
import { Badge } from "@/subframe/components/Badge";
import { Button } from "@/subframe/components/Button";

// Type definitions based on Prisma models
export enum VerificationType {
  RESIDENCE = "RESIDENCE",
  BUSINESS = "BUSINESS",
  PROPERTY = "PROPERTY",
  VEHICLE = "VEHICLE",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  IN_PROGRESS = "IN_PROGRESS",
}

export enum ResidenceType {
  OWNED = "OWNED",
  RENTED = "RENTED",
  LEASED = "LEASED",
  OTHER = "OTHER",
}

export enum StructureType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  TOWNHOUSE = "TOWNHOUSE",
  CONDOMINIUM = "CONDOMINIUM",
  OTHER = "OTHER",
}

// Generic interface for all verification types
export interface VerificationCardProps {
  /** ID of the verification */
  id: string;
  /** Status of the verification */
  status: VerificationStatus;
  /** Date when the verification was last updated */
  updatedAt?: Date;
  /** Date when the verification was completed (if applicable) */
  verificationDate?: Date;
  /** Optional remarks about the verification */
  remarks?: string | null;
  /** Function to handle view details button click */
  onViewDetails?: (id: string) => void;
  /** Additional class names for styling */
  className?: string;
}

// Base verification card component
export const VerificationCard: React.FC<
  VerificationCardProps & {
    title: string;
    icon: string;
    children: React.ReactNode;
    timeLabel?: string;
    timeValue?: string;
  }
> = ({
  id,
  title,
  icon,
  status,
  children,
  timeLabel = "Last updated:",
  timeValue = "recent",
  onViewDetails,
  className = "",
}) => {
  const statusVariant =
    status === VerificationStatus.COMPLETED ? "success" : status === VerificationStatus.REJECTED ? "error" : "warning";

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id);
    }
  };

  return (
    <div
      className={`flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 ${className}`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <IconWithBackground size="medium" icon={icon} />
          <span className="font-heading-3 text-heading-3 text-default-font">{title}</span>
        </div>
        <Badge variant={statusVariant}>{status}</Badge>
      </div>
      <div className="flex w-full flex-col items-start gap-4 border-t border-solid border-neutral-border pt-4">
        {children}
      </div>
      <div className="flex w-full items-center justify-between border-t border-solid border-neutral-border pt-4">
        <span className="font-caption text-caption text-subtext-color">
          {timeLabel} {timeValue}
        </span>
        <Button variant="neutral-secondary" size="small" onClick={handleViewDetails}>
          View Details
        </Button>
      </div>
    </div>
  );
};

// Utility function to format address
export const formatAddress = (
  addressLine1: string,
  city: string,
  state: string,
  zipCode: string,
  addressLine2?: string | null,
): string => {
  return addressLine2
    ? `${addressLine1}, ${addressLine2}, ${city}, ${state} ${zipCode}`
    : `${addressLine1}, ${city}, ${state} ${zipCode}`;
};

// Utility function to format name
export const formatName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

// TypeScript interfaces for each verification type
export interface ResidenceVerificationProps extends VerificationCardProps {
  data: {
    ownerFirstName: string;
    ownerLastName: string;
    residentSince?: string | null;
    residenceType: ResidenceType;
    structureType: StructureType;
    addressLine1: string;
    addressLine2?: string | null;
    addressCity: string;
    addressState: string;
    addressZipCode: string;
    locationFromMain: string;
  };
}

export interface BusinessVerificationProps extends VerificationCardProps {
  data: {
    businessName: string;
    businessType: string;
    addressLine1: string;
    addressLine2?: string | null;
    addressCity: string;
    addressState: string;
    addressZipCode: string;
    locationFromMain: string;
    contactDetails: string;
    businessExistence: boolean;
    natureOfBusiness: string;
    salesPerDay: string;
  };
}

export interface PropertyVerificationProps extends VerificationCardProps {
  data: {
    ownerFirstName: string;
    ownerLastName: string;
    structureType: string;
    addressLine1: string;
    addressLine2?: string | null;
    addressCity: string;
    addressState: string;
    addressZipCode: string;
    locationFromMain: string;
  };
}

export interface VehicleVerificationProps extends VerificationCardProps {
  data: {
    make: string;
    model: string;
    vehicleType?: string | null;
    engineNumber?: string | null;
    chassisNumber?: string | null;
    registrationNumber?: string | null;
  };
}

// Field row component for displaying label-value pairs
export const FieldRow: React.FC<{
  label: string;
  value: string | React.ReactNode;
  className?: string;
}> = ({ label, value, className = "" }) => (
  <div className={`flex w-full items-center gap-2 ${className}`}>
    <span className="w-32 flex-none font-body text-body text-subtext-color">{label}</span>
    <span className="font-body text-body text-default-font">{value}</span>
  </div>
);

// Component implementations
export const ResidenceVerificationCard: React.FC<ResidenceVerificationProps> = ({
  id,
  status,
  data,
  updatedAt,
  onViewDetails,
  className,
}) => {
  const formattedAddress = formatAddress(
    data.addressLine1,
    data.addressCity,
    data.addressState,
    data.addressZipCode,
    data.addressLine2,
  );

  const ownerName = formatName(data.ownerFirstName, data.ownerLastName);

  // Format date for display
  const lastUpdated = updatedAt
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(updatedAt)
    : "recently";

  return (
    <VerificationCard
      id={id}
      title="Residence Verification"
      icon="FeatherHome"
      status={status}
      timeLabel="Last updated:"
      timeValue={lastUpdated}
      onViewDetails={onViewDetails}
      className={className}
    >
      <div className="flex w-full flex-col items-start gap-2">
        <FieldRow label="Owner Name" value={ownerName} />
        <FieldRow label="Residence Type" value={data.residenceType.replace("_", " ")} />
        <FieldRow label="Structure Type" value={data.structureType.replace("_", " ")} />
        <FieldRow label="Address" value={formattedAddress} />
        {data.residentSince && <FieldRow label="Resident Since" value={data.residentSince} />}
        <FieldRow label="Location" value={data.locationFromMain} />
      </div>
    </VerificationCard>
  );
};

export const BusinessVerificationCard: React.FC<BusinessVerificationProps> = ({
  id,
  status,
  data,
  verificationDate,
  onViewDetails,
  className,
}) => {
  const formattedAddress = formatAddress(
    data.addressLine1,
    data.addressCity,
    data.addressState,
    data.addressZipCode,
    data.addressLine2,
  );

  // Format date for display
  const verifiedOn = verificationDate
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(verificationDate)
    : "recently";

  return (
    <VerificationCard
      id={id}
      title="Business Verification"
      icon="FeatherBriefcase"
      status={status}
      timeLabel="Verified on:"
      timeValue={verifiedOn}
      onViewDetails={onViewDetails}
      className={className}
    >
      <div className="flex w-full flex-col items-start gap-2">
        <FieldRow label="Business Name" value={data.businessName} />
        <FieldRow label="Business Type" value={data.businessType} />
        <FieldRow label="Nature" value={data.natureOfBusiness} />
        <FieldRow label="Location" value={formattedAddress} />
        <FieldRow label="Contact" value={data.contactDetails} />
        <FieldRow label="Sales/Day" value={data.salesPerDay} />
        <FieldRow label="Business Status" value={data.businessExistence ? "Existing" : "New"} />
      </div>
    </VerificationCard>
  );
};

export const PropertyVerificationCard: React.FC<PropertyVerificationProps> = ({
  id,
  status,
  data,
  updatedAt,
  onViewDetails,
  className,
}) => {
  const formattedAddress = formatAddress(
    data.addressLine1,
    data.addressCity,
    data.addressState,
    data.addressZipCode,
    data.addressLine2,
  );

  const ownerName = formatName(data.ownerFirstName, data.ownerLastName);

  // Format date for verification status display
  const pendingSince = updatedAt
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(updatedAt)
    : "recently";

  return (
    <VerificationCard
      id={id}
      title="Property Verification"
      icon="FeatherLandmark"
      status={status}
      timeLabel={status === VerificationStatus.PENDING ? "Pending since:" : "Last updated:"}
      timeValue={pendingSince}
      onViewDetails={onViewDetails}
      className={className}
    >
      <div className="flex w-full flex-col items-start gap-2">
        <FieldRow label="Property Type" value={data.structureType} />
        <FieldRow label="Owner" value={ownerName} />
        <FieldRow label="Location" value={formattedAddress} />
        <FieldRow label="From Main Rd" value={data.locationFromMain} />
      </div>
    </VerificationCard>
  );
};

export const VehicleVerificationCard: React.FC<VehicleVerificationProps> = ({
  id,
  status,
  data,
  updatedAt,
  onViewDetails,
  className,
}) => {
  // Format date for display
  const lastUpdated = updatedAt
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(updatedAt)
    : "recently";

  return (
    <VerificationCard
      id={id}
      title="Vehicle Verification"
      icon="FeatherTruck"
      status={status}
      timeLabel="Last updated:"
      timeValue={lastUpdated}
      onViewDetails={onViewDetails}
      className={className}
    >
      <div className="flex w-full flex-col items-start gap-2">
        <FieldRow label="Make" value={data.make} />
        <FieldRow label="Model" value={data.model} />
        {data.vehicleType && <FieldRow label="Vehicle Type" value={data.vehicleType} />}
        {data.registrationNumber && <FieldRow label="Registration" value={data.registrationNumber} />}
        {data.engineNumber && <FieldRow label="Engine No." value={data.engineNumber} />}
        {data.chassisNumber && <FieldRow label="Chassis No." value={data.chassisNumber} />}
      </div>
    </VerificationCard>
  );
};
