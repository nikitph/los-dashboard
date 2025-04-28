"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

interface PhotoCaptureHeaderProps {
  onBack: () => void;
}

export function PhotoCaptureHeader({ onBack }: PhotoCaptureHeaderProps) {
  const t = useTranslations("PhotoCapture");

  return (
    <div className="flex w-full items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">{t("header.title")}</h1>
    </div>
  );
}
