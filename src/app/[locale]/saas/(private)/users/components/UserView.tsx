"use client";

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
import { useUserView } from "../hooks/useUserView";

export interface UserViewProps {
  user: UserRecord;
  approveMode: boolean;
  onActionComplete?: () => void;
}

/**
 * Component for displaying user details and approval/rejection actions
 * Uses useUserView hook for all logic and state management
 */
export default function UserView({ user, approveMode, onActionComplete }: UserViewProps) {
  const {
    isRejectDialogOpen,
    remarks,
    isSubmitting,
    remarksError,
    fullName,
    initials,
    visibility,
    setIsRejectDialogOpen,
    setRemarks,
    handleRejectClick,
    handleRejectSubmit,
    handleApproveClick,
    t, // Get translation function from the hook
  } = useUserView({ user, approveMode, onActionComplete });

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
            {visibility.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
            {visibility.role && (
              <Badge variant="outline" className="mt-1">
                {user.role}
              </Badge>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          {visibility.phoneNumber && (
            <div>
              <p className="text-muted-foreground">{t("form.phoneNumber.label")}</p>
              <p>{user.phoneNumber || "—"}</p>
            </div>
          )}
          {visibility.branch && (
            <div>
              <p className="text-muted-foreground">{t("form.branch.label")}</p>
              <p>{user.branch || "—"}</p>
            </div>
          )}
          {visibility.status && (
            <div>
              <p className="text-muted-foreground">{t("form.status.label")}</p>
              <p>{user.status}</p>
            </div>
          )}
          {visibility.lastLogin && (
            <div>
              <p className="text-muted-foreground">{t("form.lastLogin.label")}</p>
              <p>{user.lastLogin || "—"}</p>
            </div>
          )}
        </div>
      </Card>

      {approveMode && visibility.canApprove && (
        <div className="flex justify-start gap-4 pt-4">
          <Button variant="default" onClick={handleApproveClick} disabled={isSubmitting}>
            {isSubmitting ? t("form.buttons.processing") : t("form.buttons.approve")}
          </Button>
          {visibility.canReject && (
            <Button
              variant="outline"
              className="border-red-500 text-red-500 hover:text-red-500"
              onClick={handleRejectClick}
              disabled={isSubmitting}
            >
              {t("form.buttons.reject")}
            </Button>
          )}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("form.rejectDialog.title")}</DialogTitle>
            <DialogDescription>{t("form.rejectDialog.description")}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="remarks" className="mb-2 flex items-center">
              {t("form.rejectDialog.remarks.label")} <span className="ml-1 text-red-500">*</span>
            </Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (e.target.value.trim()) {
                  // Clear error when user types valid content
                }
              }}
              className={`min-h-24 resize-none ${remarksError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              placeholder={t("form.rejectDialog.remarks.placeholder")}
            />
            {remarksError && <p className="mt-1 text-sm text-red-500">{remarksError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isSubmitting}>
              {t("form.buttons.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={isSubmitting}>
              {isSubmitting ? t("form.buttons.submitting") : t("form.buttons.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
