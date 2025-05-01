"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { getTimelineEventMeta } from "@/constants/timelineEventMeta";
import { TimelineEventType } from "@prisma/client";

const dummyEvents = [
  {
    id: "1",
    timelineEventType: "APPLICATION_CREATED" as TimelineEventType,
    timelineEntityType: "LOAN_APPLICATION",
    timelinEntityId: "loan123",
    userId: "user1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    remarks: "Loan application created",
    actionData: {},
    loanApplicationId: "loan123",
    applicantId: null,
    documentId: null,
    user: { firstName: "Tom", lastName: "Bradley" },
  },
  {
    id: "2",
    timelineEventType: "USER_ASSIGNED_ROLE" as TimelineEventType,
    timelineEntityType: "LOAN_APPLICATION",
    timelinEntityId: "loan123",
    userId: "user2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    remarks: null,
    actionData: {},
    loanApplicationId: "loan123",
    applicantId: null,
    documentId: null,
    user: { firstName: "Michael", lastName: "Chen" },
  },
  {
    id: "3",
    timelineEventType: "DOCUMENT_UPLOADED" as TimelineEventType,
    timelineEntityType: "DOCUMENT",
    timelinEntityId: "doc456",
    userId: "user3",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    remarks: "Uploaded business plan",
    actionData: {},
    loanApplicationId: null,
    applicantId: null,
    documentId: "doc456",
    user: { firstName: "Tom", lastName: "Bradley" },
  },
  {
    id: "4",
    timelineEventType: "DOCUMENT_REQUESTED" as TimelineEventType,
    timelineEntityType: "DOCUMENT",
    timelinEntityId: "doc789",
    userId: "user4",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    remarks: "Please provide last 3 months of business bank statements",
    actionData: {},
    loanApplicationId: null,
    applicantId: null,
    documentId: "doc789",
    user: { firstName: "Sarah", lastName: "Johnson" },
  },
];

type IconWithBackgroundProps = {
  icon: React.ElementType;
  variant?: "default" | "success" | "neutral" | "warning" | "info" | "destructive";
};

const IconWithBackground = ({ icon: Icon, variant = "default" }: IconWithBackgroundProps) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    neutral: "bg-gray-100 text-gray-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-blue-100 text-blue-700",
    destructive: "bg-red-100 text-red-700",
  };

  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full p-1 ${variantClasses[variant]}`}>
      <Icon size={16} />
    </div>
  );
};

type TimelineProps = {
  events?: typeof dummyEvents;
};

const Timeline = ({ events = dummyEvents }: TimelineProps) => {
  return (
    <div className="flex flex-1 flex-col items-start gap-4">
      <h3 className="text-2xl font-semibold">Application Timeline</h3>
      <div className="flex w-full flex-col items-start">
        {events.map((event, index) => {
          const { label, icon, variant } = getTimelineEventMeta(event.timelineEventType);
          const userName = `${event.user.firstName ?? ""} ${event.user.lastName ?? ""}`.trim();
          const timeAgo = formatDistanceToNow(new Date(event.createdAt), { addSuffix: true });

          return (
            <div key={event.id} className="flex w-full items-start gap-4">
              <div className="flex flex-col items-center self-stretch">
                <div className="flex flex-col items-start gap-1">
                  <IconWithBackground icon={icon} variant={variant || "default"} />
                </div>
                {index < events.length - 1 && <div className="h-full w-0.5 bg-gray-200 pt-4" />}
              </div>
              <div className="flex flex-1 flex-col items-start gap-2 py-1.5">
                <div className="flex w-full flex-wrap items-center gap-2">
                  <div className="flex flex-1 flex-wrap items-start gap-1">
                    <span className="font-semibold text-gray-900">{userName}</span>
                    <span className="text-gray-600">{label.toLowerCase()}</span>
                  </div>
                  <span className="text-xs text-gray-500">{timeAgo}</span>
                </div>
                {event.remarks && (
                  <Alert className="max-h-[40px] border-none bg-secondary">
                    <AlertDescription className="mt-[-8px] flex items-center justify-between">
                      {event.remarks}
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        ×
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
