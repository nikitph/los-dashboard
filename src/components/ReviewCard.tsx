"use client";

import React from "react";
import { IconWithBackground } from "@/subframe/components/IconWithBackground";
import { format } from "date-fns";
import { Review, ReviewEntityType } from "@prisma/client";

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps): React.ReactNode => {
  // Format the date string
  const formattedDate = review.createdAt ? format(new Date(review.createdAt), "dd/MM/yyyy, h:mm a") : "N/A";

  // Generate a display title based on review type
  const getReviewTitle = () => {
    switch (review.reviewEntityType) {
      case ReviewEntityType.LOAN_APPLICATION:
        return "Loan Application Review";
      case ReviewEntityType.APPLICANT:
        return "Applicant Review";
      case ReviewEntityType.DOCUMENT:
        return "Document Review";
      case ReviewEntityType.VERIFICATION:
        return "Verification Review";
      default:
        return "Review";
    }
  };

  // Determine the status display based on result
  const getStatusDisplay = () => {
    if (review.result) {
      return (
        <div className="flex items-start rounded-md bg-success-100 px-3 py-1">
          <span className="font-caption-bold text-caption-bold text-success-700">Approved</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-start rounded-md bg-error-100 px-3 py-1">
          <span className="font-caption-bold text-caption-bold text-error-700">Rejected</span>
        </div>
      );
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-6 py-2">
      <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <IconWithBackground size="large" icon="FeatherClipboardCheck" />
            <div className="flex flex-col items-start gap-1">
              <span className="font-caption text-caption text-subtext-color">ID: {review.id}</span>
              <span className="font-heading-3 text-heading-3 text-default-font">{getReviewTitle()}</span>
            </div>
          </div>
          {getStatusDisplay()}
        </div>
        <div className="flex w-full flex-wrap items-start gap-6 rounded-md bg-gray-100 px-2 py-2">
          <div className="flex shrink-0 grow basis-0 items-center gap-4">
            <div className="flex flex-col items-start gap-1">
              <span className="font-caption text-caption text-subtext-color">Name</span>
              <span className="font-body-bold text-body-bold text-default-font">{review.userName}</span>
            </div>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center gap-4">
            <div className="flex flex-col items-start gap-1">
              <span className="font-caption text-caption text-subtext-color">Role</span>
              <span className="font-body-bold text-body-bold text-default-font">{review.role.replace(/_/g, " ")}</span>
            </div>
          </div>
          <div className="flex shrink-0 grow basis-0 items-center gap-4">
            <div className="flex flex-col items-start gap-1">
              <span className="font-caption text-caption text-subtext-color">Date &amp; Time</span>
              <span className="font-body-bold text-body-bold text-default-font">{formattedDate}</span>
            </div>
          </div>
        </div>
        {review.remarks && (
          <div className="flex w-full flex-col items-start gap-2">
            <span className="font-caption text-caption text-subtext-color">
              Remarks by {review.role.replace(/_/g, " ")}
            </span>
            <div className="flex w-full items-start rounded-md border border-neutral-200 bg-neutral-50 px-4 py-4">
              <span className="font-body text-body text-default-font">{review.remarks}</span>
            </div>
          </div>
        )}
        {review.actionData && Object.keys(review.actionData).length > 0 && (
          <div className="flex w-full flex-col items-start gap-2">
            <span className="font-caption text-caption text-subtext-color">Action Data</span>
            <div className="flex w-full items-start rounded-md border border-neutral-200 bg-neutral-50 px-4 py-4">
              <pre className="font-mono text-sm text-default-font">{JSON.stringify(review.actionData, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
