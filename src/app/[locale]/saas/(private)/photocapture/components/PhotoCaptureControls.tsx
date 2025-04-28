"use client";

import { Button } from "@/components/ui/button";
import ImageUploadButton from "@/components/ImageUploadButton";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/userContext";

interface PhotoCaptureControlsProps {
  isCaptureMode: boolean;
  showCamera: boolean;
  image: string | null;
  capturedFile: File | null;
  capturedPreview: string | null;
  entityId: string;
  onCapture: () => void;
  onReset: () => void;
  onProceed: () => void;
  onUploadSuccess: (docId: string) => void;
}

export function PhotoCaptureControls({
  isCaptureMode,
  showCamera,
  image,
  capturedFile,
  capturedPreview,
  entityId,
  onCapture,
  onReset,
  onProceed,
  onUploadSuccess,
}: PhotoCaptureControlsProps) {
  const t = useTranslations("PhotoCapture");
  const { user } = useUser();

  return (
    <div className="flex w-full items-start justify-center gap-4">
      {isCaptureMode ? (
        <Button className="flex-1" onClick={onCapture} disabled={!showCamera}>
          {t("controls.capture")}
        </Button>
      ) : (
        <ImageUploadButton
          documentType="APPLICANT_PHOTO"
          entityType="applicant"
          entityId={entityId}
          // @ts-ignore
          uploadedById={user?.id}
          description={t("controls.photoDescription")}
          onUploadSuccess={onUploadSuccess}
          file={capturedFile}
          filePreviewUrl={capturedPreview}
          onRemove={onReset}
        />
      )}

      <Button onClick={onProceed} disabled={!image}>
        {t("controls.proceed")}
      </Button>
    </div>
  );
}
