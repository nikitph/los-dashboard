"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PencilIcon, TrashIcon, TriangleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useViewApplicantForm } from "../hooks/useViewApplicantForm";
import { getVerificationStatusColor } from "../lib/helpers";
import { ApplicantView } from "../schemas/applicantSchema";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type ViewApplicantFormProps = {
  applicant: ApplicantView;
};

type InfoItemProps = {
  label: string;
  value: string | ReactNode;
  badge?: ReactNode;
  className?: string;
};

export function InfoItem({ label, value, badge, className }: InfoItemProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold">{value}</p>
        {badge && <div className="ml-4 shrink-0">{badge}</div>}
      </div>
    </div>
  );
}

/**
 * View component for displaying applicant details
 */
export function ViewApplicantForm({ applicant }: ViewApplicantFormProps) {
  const t = useTranslations("Applicant");
  const {
    visibility,
    formattedValues,
    isDeleting,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDelete,
    handleEdit,
    canEdit,
    canDelete,
  } = useViewApplicantForm(applicant);

  if (!applicant) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{t("view.notFound.title")}</CardTitle>
          <CardDescription>{t("view.notFound.description")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{t("view.title")}</CardTitle>
          <CardDescription>{t("view.description")}</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {applicant.verificationStatus && (
            <Badge className={getVerificationStatusColor(applicant.verificationStatus)}>
              {t(`view.verificationStatus.${applicant.verificationStatus.toLowerCase()}`)}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Show an alert for deleted applicants */}
      {applicant.deletedAt && (
        <div className="px-6 pb-3">
          <Alert variant="destructive">
            <TriangleIcon className="h-4 w-4" />
            <AlertTitle>{t("view.alert.deleted.title")}</AlertTitle>
            <AlertDescription>{t("view.alert.deleted.description")}</AlertDescription>
          </Alert>
        </div>
      )}

      <CardContent className="grid gap-6">
        {/* Personal Information Section */}
        {(visibility.fullName || visibility.dateOfBirth) && (
          <div>
            <h3 className="mb-4 text-lg font-medium">{t("view.sections.personal")}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibility.fullName && applicant.fullName && (
                <InfoItem label={t("view.fullName")} value={applicant.fullName} />
              )}
              {visibility.dateOfBirth && (
                <InfoItem label={t("view.dateOfBirth")} value={formattedValues.dateOfBirth || t("view.notProvided")} />
              )}
              {visibility.photoUrl && applicant.photoUrl && (
                <InfoItem label={t("view.photoUrl")} value={applicant.photoUrl} />
              )}
            </div>
          </div>
        )}

        {/* Address Section */}
        {(visibility.addressState || visibility.addressCity || visibility.addressFull || visibility.addressPinCode) && (
          <div>
            <h3 className="mb-4 text-lg font-medium">{t("view.sections.address")}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibility.fullAddress && formattedValues.fullAddress && (
                <div className="col-span-2">
                  <InfoItem label={t("view.fullAddress")} value={formattedValues.fullAddress} />
                </div>
              )}
              {visibility.addressState && applicant.addressState && (
                <InfoItem label={t("view.addressState")} value={applicant.addressState} />
              )}
              {visibility.addressCity && applicant.addressCity && (
                <InfoItem label={t("view.addressCity")} value={applicant.addressCity} />
              )}
              {visibility.addressPinCode && applicant.addressPinCode && (
                <InfoItem label={t("view.addressPinCode")} value={applicant.addressPinCode} />
              )}
            </div>
          </div>
        )}

        {/* Verification Section */}
        {(visibility.aadharNumber ||
          visibility.panNumber ||
          visibility.aadharVerificationStatus ||
          visibility.panVerificationStatus) && (
          <div>
            <h3 className="mb-4 text-lg font-medium">{t("view.sections.verification")}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibility.aadharNumber && (
                <InfoItem
                  label={t("view.aadharNumber")}
                  value={formattedValues.maskedAadhar || t("view.notProvided")}
                  badge={
                    visibility.aadharVerificationStatus && (
                      <Badge variant={applicant.aadharVerificationStatus ? "success" : "destructive"}>
                        {applicant.aadharVerificationStatus ? t("view.verified") : t("view.unverified")}
                      </Badge>
                    )
                  }
                />
              )}
              {visibility.panNumber && (
                <InfoItem
                  label={t("view.panNumber")}
                  value={formattedValues.maskedPan || t("view.notProvided")}
                  badge={
                    visibility.panVerificationStatus && (
                      <Badge variant={applicant.panVerificationStatus ? "success" : "destructive"}>
                        {applicant.panVerificationStatus ? t("view.verified") : t("view.unverified")}
                      </Badge>
                    )
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* System Information Section */}
        {(visibility.createdAt || visibility.updatedAt || visibility.bankId) && (
          <div>
            <h3 className="mb-4 text-lg font-medium">{t("view.sections.system")}</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibility.createdAt && (
                <InfoItem
                  label={t("view.createdAt")}
                  value={formattedValues.createdAt || applicant.createdAt?.toLocaleString()}
                />
              )}
              {visibility.bankId && <InfoItem label={t("view.bankId")} value={applicant.bankId} />}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          {t("view.actions.back")}
        </Button>

        <div className="flex space-x-2">
          {canEdit && (
            <Button variant="outline" onClick={handleEdit} disabled={!!applicant.deletedAt}>
              <PencilIcon className="mr-2 h-4 w-4" />
              {t("view.actions.edit")}
            </Button>
          )}

          {canDelete && (
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={!!applicant.deletedAt}>
                  <TrashIcon className="mr-2 h-4 w-4" />
                  {t("view.actions.delete")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("delete.confirmTitle")}</DialogTitle>
                  <DialogDescription>{t("delete.confirmDescription")}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    {t("delete.cancel")}
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    {t("delete.confirm")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
