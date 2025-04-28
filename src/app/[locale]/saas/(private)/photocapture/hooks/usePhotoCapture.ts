"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export type PhotoCaptureState = {
  image: string | null;
  capturedFile: File | null;
  capturedPreview: string | null;
  showCamera: boolean;
  isCaptureMode: boolean;
};

export type PhotoCaptureActions = {
  captureImage: () => void;
  resetCamera: () => void;
  handleBack: () => void;
  handleProceed: () => void;
  onUploadSuccess: (docId: string) => void;
};

export type PhotoCaptureRefs = {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
};

export function usePhotoCapture(aid?: string, lid?: string) {
  const router = useRouter();
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

        // Create a file from the data URL for uploading
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "applicant-photo.jpg", { type: "image/jpeg" });
            setCapturedFile(file);
            setCapturedPreview(dataUrl);
          });

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
    setCapturedPreview(null);
    setIsCaptureMode(true);
    setShowCamera(true);
  };

  // Navigation functions
  const handleBack = () => {
    router.back();
  };

  const handleProceed = () => {
    router.push(`/${locale}/saas/loanobligations?aid=${aid}&lid=${lid}`);
  };

  const onUploadSuccess = (docId: string) => {
    console.log(`Image uploaded with ID: ${docId}`);
  };

  const state: PhotoCaptureState = {
    image,
    capturedFile,
    capturedPreview,
    showCamera,
    isCaptureMode,
  };

  const actions: PhotoCaptureActions = {
    captureImage,
    resetCamera,
    handleBack,
    handleProceed,
    onUploadSuccess,
  };

  // @ts-ignore
  const refs: PhotoCaptureRefs = {
    // @ts-ignore
    videoRef,
    // @ts-ignore
    canvasRef,
  };

  return {
    state,
    actions,
    refs,
  };
}
