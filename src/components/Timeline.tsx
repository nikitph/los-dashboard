"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Alert } from "@/subframe/components/Alert";
import { getTimelineEventMeta } from "@/constants/timelineEventMeta";
import type { TimelineEvent } from "@prisma/client";

/* ------------------------------------------------------------------ */
/* Icon chip with rounded background                                  */
/* ------------------------------------------------------------------ */
type IconWithBackgroundProps = {
  icon: React.ElementType;
  variant?: "default" | "success" | "neutral" | "warning" | "info" | "destructive";
  size?: "small" | "medium" | "large";
};

const iconSizes = {
  small: "h-6 w-6 p-0.5",
  medium: "h-8 w-8 p-1",
  large: "h-10 w-10 p-[6px]",
};

const IconWithBackground = ({ icon: Icon, variant = "default", size = "small" }: IconWithBackgroundProps) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    neutral: "bg-gray-100 text-gray-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-blue-100 text-blue-700",
    destructive: "bg-red-100 text-red-700",
  };
  return (
    <div className={`flex items-center justify-center rounded-full ${iconSizes[size]} ${variantClasses[variant]}`}>
      <Icon size={14} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Single timeline row (Subframe spec)                                */

/* ------------------------------------------------------------------ */
interface TimelineRowProps {
  event: any;
  isLast: boolean;
}

const TimelineRow = ({ event, isLast }: TimelineRowProps) => {
  const { label, icon, variant } = getTimelineEventMeta(event.timelineEventType);
  const userName = `${event.user.firstName ?? ""} ${event.user.lastName ?? ""}`.trim();
  const timeAgo = formatDistanceToNow(new Date(event.createdAt), { addSuffix: true });

  return (
    <div className="flex w-full shrink-0 grow basis-0 items-start gap-4">
      {/* ─ Left rail: icon + connector */}
      <div className="flex flex-col items-center self-stretch">
        <div className="flex flex-col items-start gap-1">
          <IconWithBackground icon={icon} variant={variant} size="medium" />
        </div>
        {!isLast && <div className="flex w-0.5 shrink-0 grow basis-0 flex-col items-start gap-2 bg-neutral-border" />}
      </div>

      {/* ─ Right panel: text + optional alert */}
      <div className={`flex shrink-0 grow basis-0 flex-col items-start gap-2 ${isLast ? "py-1" : "pb-6 pt-1.5"}`}>
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex shrink-0 grow basis-0 flex-wrap items-start gap-1">
            <span className="font-body-bold text-body-bold text-default-font">{userName}</span>
            <span className="font-body text-body text-subtext-color">{label.toLowerCase()}</span>
          </div>
          <span className="font-caption text-caption text-subtext-color">{timeAgo}</span>
        </div>
        {event.remarks && <Alert title="" description={event.remarks} />}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Timeline wrapper                                                   */
/* ------------------------------------------------------------------ */
type TimelineProps = {
  events?: TimelineEvent[];
};

const Timeline = ({ events }: TimelineProps) => {
  const sortedEvents = [...(events ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return (
    <div className="flex w-full flex-col items-start">
      {sortedEvents?.map((event, i) => <TimelineRow key={event.id} event={event} isLast={i === events?.length - 1} />)}
    </div>
  );
};

export default Timeline;
