"use client";

import React from "react";
import { Badge } from "@/components/subframe/ui";
import type { IconName } from "@subframe/core";
import { LoanStatus } from "@prisma/client";

const statusMap: Record<
  LoanStatus,
  {
    label: string;
    variant: "brand" | "neutral" | "error" | "warning" | "success";
    icon: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    variant: "neutral",
    icon: "PencilLine",
  },
  PENDING_INSPECTOR_ASSIGNMENT: {
    label: "Waiting for Inspector",
    variant: "warning",
    icon: "FeatherUserPlus2",
  },
  PENDING_LOAN_OFFICER_ASSIGNMENT: {
    label: "Waiting for Loan Officer",
    variant: "warning",
    icon: "FeatherUserPlus2",
  },
  PENDING_LOAN_OFFICER_REVIEW: {
    label: "Under Loan Officer Review",
    variant: "warning",
    icon: "ClipboardList",
  },
  PENDING_VERIFICATION: {
    label: "Pending Verification",
    variant: "warning",
    icon: "ShieldQuestion",
  },
  VERIFICATION_IN_PROGRESS: {
    label: "Verifying",
    variant: "warning",
    icon: "Loader",
  },
  VERIFICATION_COMPLETED: {
    label: "Verified",
    variant: "success",
    icon: "ShieldCheck",
  },
  VERIFICATION_FAILED: {
    label: "Verification Failed",
    variant: "error",
    icon: "ShieldX",
  },
  PENDING: {
    label: "Pending",
    variant: "brand",
    icon: "Clock",
  },
  APPROVED: {
    label: "Approved",
    variant: "success",
    icon: "CheckCircle",
  },
  REJECTED: {
    label: "Rejected",
    variant: "error",
    icon: "XCircle",
  },
  REJECTED_BY_APPLICANT: {
    label: "Withdrawn by Applicant",
    variant: "neutral",
    icon: "ArrowLeftCircle",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    variant: "warning",
    icon: "Search",
  },
};

export const LoanStatusBadge = ({ status }: { status: LoanStatus }) => {
  const { label, variant, icon } = statusMap[status];

  return (
    <Badge variant={variant} icon={icon as IconName}>
      {label}
    </Badge>
  );
};
