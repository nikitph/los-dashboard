"use client";

import { useState } from "react";
import { UserRecord } from "@/app/[locale]/saas/(private)/users/schema";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { approvePendingAction, rejectPendingAction } from "@/app/[locale]/saas/(private)/users/actions";
import { toastError, toastSuccess } from "@/lib/toastUtils";
import { useRouter } from "@/i18n/navigation";
import { revalidatePath } from "next/cache";

export default function UserView({
  user,
  approveMode,
  onActionComplete,
}: {
  user: UserRecord;
  approveMode: boolean;
  onActionComplete?: () => void;
}) {
  const router = useRouter();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remarksError, setRemarksError] = useState("");

  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
    setRemarks("");
    setRemarksError("");
  };

  const handleRejectSubmit = async () => {
    // Validate remarks
    if (!remarks.trim()) {
      setRemarksError("Remarks are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the server action with the pending action ID and remarks
      await rejectPendingAction(user.id, remarks);

      toastSuccess({ title: "Succes", description: "The user has been successfully rejected" });

      // Notify parent component that action is complete
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      toastError({
        title: "Error",
        description: "Failed to reject user. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setIsRejectDialogOpen(false);
    }
  };

  const handleApproveClick = async () => {
    setIsSubmitting(true);

    try {
      const res = await approvePendingAction(user.id);
      console.log("Approval result:", res);
      revalidatePath("/page");

      toastSuccess({
        title: "User approved",
        description: "The user has been successfully approved",
      });

      // Notify parent component that action is complete
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error("Error approving user:", error);
      toastError({
        title: "Error",
        description: "Failed to approve user. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatarUrl} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-xl font-semibold">{fullName}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-1">
              {user.role}
            </Badge>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Phone Number</p>
            <p>{user.phoneNumber || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Branch</p>
            <p>{user.branch || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p>{user.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Login</p>
            <p>{user.lastLogin || "—"}</p>
          </div>
        </div>
      </Card>

      {approveMode && (
        <div className="flex justify-start gap-4 pt-4">
          <Button variant="default" onClick={handleApproveClick} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Approve"}
          </Button>
          <Button
            variant="outline"
            className="border-red-500 text-red-500 hover:text-red-500"
            onClick={handleRejectClick}
            disabled={isSubmitting}
          >
            Reject
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject User Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this user.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="remarks" className="mb-2 flex items-center">
              Remarks <span className="ml-1 text-red-500">*</span>
            </Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (e.target.value.trim()) {
                  setRemarksError("");
                }
              }}
              className={`min-h-24 resize-none ${remarksError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              placeholder="Enter your reason for rejection..."
            />
            {remarksError && <p className="mt-1 text-sm text-red-500">{remarksError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
