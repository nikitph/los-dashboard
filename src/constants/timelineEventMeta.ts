import {
  ArrowUp,
  CalendarClock,
  Check,
  CheckCircle,
  Clock,
  Cross,
  Eye,
  FileCheck,
  FileSearch,
  FileX,
  Info,
  Lock,
  MessageCircle,
  Pencil,
  PlusCircle,
  RefreshCcw,
  RotateCcw,
  Settings,
  ShieldCheck,
  StickyNote,
  Trash,
  Unlock,
  Upload,
  UserCheck,
  UserMinus,
  UserPlus,
  Workflow,
  XCircle,
} from "lucide-react";
import type { TimelineEventType } from "@prisma/client";

export const timelineEventMeta: Record<
  TimelineEventType,
  {
    label: string;
    icon: React.ElementType;
    variant?: "default" | "destructive" | "success" | "warning" | "info" | "neutral";
  }
> = {
  // Application
  APPLICATION_CREATED: { label: "Application created", icon: PlusCircle, variant: "success" },
  APPLICATION_UPDATED: { label: "Application updated", icon: Pencil, variant: "info" },
  APPLICATION_DELETED: { label: "Application deleted", icon: Trash, variant: "destructive" },
  APPLICATION_REOPENED: { label: "Application reopened", icon: RotateCcw, variant: "warning" },
  STATUS_CHANGE: { label: "Status changed", icon: RefreshCcw, variant: "info" },

  // Documents
  DOCUMENT_UPLOADED: { label: "Document uploaded", icon: Upload, variant: "success" },
  DOCUMENT_REVIEWED: { label: "Document reviewed", icon: FileCheck, variant: "success" },
  DOCUMENT_DELETED: { label: "Document deleted", icon: FileX, variant: "destructive" },
  DOCUMENT_REQUESTED: { label: "Document requested", icon: FileSearch, variant: "warning" },

  // User
  USER_CREATED: { label: "User created", icon: UserPlus, variant: "success" },
  USER_ASSIGNED_ROLE: { label: "Role assigned", icon: UserCheck, variant: "success" },
  USER_REMOVED_ROLE: { label: "Role removed", icon: UserMinus, variant: "destructive" },

  // Verification
  VERIFICATION_STARTED: { label: "Verification started", icon: Eye, variant: "info" },
  VERIFICATION_COMPLETED: { label: "Verification completed", icon: CheckCircle, variant: "success" },
  VERIFICATION_FAILED: { label: "Verification failed", icon: XCircle, variant: "destructive" },
  VERIFICATION_REMARK_ADDED: { label: "Verification remarks added", icon: StickyNote, variant: "neutral" },

  // Approval
  ACTION_REQUESTED: { label: "Approval requested", icon: Workflow, variant: "warning" },
  ACTION_APPROVED: { label: "Action approved", icon: CheckCircle, variant: "success" },
  ACTION_REJECTED: { label: "Action rejected", icon: XCircle, variant: "destructive" },
  ACTION_CANCELLED: { label: "Action cancelled", icon: Clock, variant: "warning" },
  ACTION_REVIEWED: { label: "Action reviewed", icon: CalendarClock, variant: "neutral" },

  // Notes / remarks
  NOTE_ADDED: { label: "Note added", icon: MessageCircle, variant: "neutral" },
  REMARK_ADDED: { label: "Remark added", icon: StickyNote, variant: "neutral" },

  // System
  SYSTEM_EVENT: { label: "System event", icon: Settings, variant: "info" },
  AUTO_VERIFICATION: { label: "Auto verification", icon: ShieldCheck, variant: "info" },
  SCHEDULED_TASK_COMPLETED: { label: "Scheduled task completed", icon: RefreshCcw, variant: "success" },

  // Security
  ACCESS_GRANTED: { label: "Access granted", icon: Unlock, variant: "success" },
  ACCESS_REVOKED: { label: "Access revoked", icon: Lock, variant: "destructive" },
  APPLICATION_ESCALATED: {
    label: "Application Escalated",
    icon: ArrowUp,
    variant: "warning",
  },
  APPLICATION_APPROVED: {
    label: "Application Approved",
    icon: Check,
    variant: "success",
  },
  APPLICATION_REJECTED: {
    label: "Application Rejected",
    icon: Cross,
    variant: "destructive",
  },
  APPLICATION_REVIEW_REJECTED: {
    label: "Application Review Rejected",
    icon: Cross,
    variant: "warning",
  },
  APPLICATION_REVIEW_APPROVED: {
    label: "Application Review Approved",
    icon: Check,
    variant: "info",
  },
  VERIFICATION_CREATED: {
    label: "Verification Created",
    icon: PlusCircle,
    variant: "success",
  },
  VERIFICATION_REVIEW_APPROVED: {
    label: "Verification Review Approved",
    icon: Check,
    variant: "info",
  },
  VERIFICATION_REVIEW_REJECTED: {
    label: "Verification Review Rejected",
    icon: Cross,
    variant: "warning",
  },
  SANCTION_REMARK_ADDED: {
    label: "Sanction Remark Added",
    icon: PlusCircle,
    variant: "neutral",
  },
  INSPECTION_REMARK_ADDED: {
    label: "Inspection Remark Added",
    icon: PlusCircle,
    variant: "neutral",
  },
  CLERK_REMARK_ADDED: {
    label: "Clerk Added a remark",
    icon: PlusCircle,
    variant: "info",
  },
};

export function getTimelineEventMeta(type: TimelineEventType) {
  return (
    timelineEventMeta[type] ?? {
      label: "Unknown event",
      icon: Info,
      variant: "default",
    }
  );
}
