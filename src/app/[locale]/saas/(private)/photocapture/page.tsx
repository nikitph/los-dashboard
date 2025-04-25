"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";
import ImageUploadButton from "@/components/ImageUploadButton";
import { useUser } from "@/contexts/userContext";
import { useLocale } from "next-intl";

// TypeScript function to convert data URL to File
function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr: string[] = dataUrl.split(",");
  const matches: RegExpMatchArray | null = arr[0].match(/:(.*?);/);

  if (!matches || matches.length < 2) {
    throw new Error("Invalid data URL format");
  }

  const mime: string = matches[1];
  const bstr: string = atob(arr[1]);
  let n: number = bstr.length;
  const u8arr: Uint8Array = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

export default function PhotoCapturePage({ searchParams }: { searchParams: { aid: string; lid: string } }) {
  const router = useRouter();
  const { aid, lid } = searchParams;
  const { user } = useUser();
  const locale = useLocale();

  // State variables
  const [image, setImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const [isCaptureMode, setIsCaptureMode] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    async function setupCamera() {
      if (showCamera && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          });

          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        } catch (err) {
          console.error("Error accessing camera:", err);
        }
      }
    }

    setupCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [showCamera]);

  // Capture image from video stream
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL (image)
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImage(dataUrl);

        // Convert data URL to File object
        try {
          const file = dataURLtoFile(dataUrl, "profile-photo.jpg");
          setCapturedFile(file);
        } catch (error) {
          console.error("Error converting to file:", error);
        }

        // Switch from capture mode to upload mode
        setIsCaptureMode(false);
        setShowCamera(false);

        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      }
    }
  };

  // Reset camera for a new photo
  const resetCamera = () => {
    setImage(null);
    setCapturedFile(null);
    setIsCaptureMode(true);
    setShowCamera(true);
  };

  // Navigation functions
  const handleBack = () => {
    router.back();
  };

  const handleProceed = () => {
    router.push(`/${locale}/saas/loanobligations`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto flex w-full max-w-[576px] flex-col items-start gap-8">
        {/* Header */}
        <div className="flex w-full items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Photo Capture</h1>
        </div>

        <div className="flex w-full flex-col items-center gap-6">
          {/* Camera/Image display area */}
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center p-6">
              {showCamera ? (
                <div className="aspect-square w-full max-w-[384px] overflow-hidden rounded-full">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                </div>
              ) : image ? (
                <div className="aspect-square w-full max-w-[384px] overflow-hidden rounded-full">
                  <img src={image} alt="Captured" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-square w-full max-w-[384px] items-center justify-center rounded-full bg-gray-200">
                  <User className="h-24 w-24 text-gray-400" />
                </div>
              )}
              {/* Hidden canvas for capturing frames */}
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>

          {/* Camera controls */}
          <div className="flex w-full items-start justify-center gap-4">
            {isCaptureMode ? (
              <Button className="flex-1" onClick={captureImage} disabled={!showCamera}>
                Capture Photo
              </Button>
            ) : (
              <ImageUploadButton
                documentType="APPLICANT_PHOTO"
                entityType="applicant"
                entityId={aid}
                // @ts-ignore
                uploadedById={user?.id}
                description="Applicant profile photo"
                onUploadSuccess={(docId) => console.log(`Image uploaded with ID: ${docId}`)}
                file={capturedFile}
                filePreviewUrl={capturedPreview}
                onRemove={() => {
                  resetCamera();
                }}
              />
            )}

            <Button onClick={handleProceed} disabled={!image}>
              Proceed to Income Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
