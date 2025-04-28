// /src/app/[locale]/saas/(private)/photoCapture/components/CameraView.tsx
"use client";

import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  showCamera: boolean;
  image: string | null;
}

export function CameraView({ videoRef, canvasRef, showCamera, image }: CameraViewProps) {
  return (
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
  );
}
