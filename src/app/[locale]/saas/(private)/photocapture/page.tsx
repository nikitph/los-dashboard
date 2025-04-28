"use client";

import { usePhotoCapture } from "./hooks/usePhotoCapture";
import { PhotoCaptureHeader } from "./components/PhotoCaptureHeader";
import { CameraView } from "./components/CameraView";
import { PhotoCaptureControls } from "./components/PhotoCaptureControls";

export default function PhotoCapturePage({ searchParams }: { searchParams: { aid: string; lid: string } }) {
  const { aid, lid } = searchParams;
  const { state, actions, refs } = usePhotoCapture(aid, lid);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto flex w-full max-w-[576px] flex-col items-start gap-8">
        {/* Header */}
        <PhotoCaptureHeader onBack={actions.handleBack} />

        <div className="flex w-full flex-col items-center gap-6">
          {/* Camera/Image display area */}
          <CameraView
            videoRef={refs.videoRef}
            canvasRef={refs.canvasRef}
            showCamera={state.showCamera}
            image={state.image}
          />

          {/* Camera controls */}
          <PhotoCaptureControls
            isCaptureMode={state.isCaptureMode}
            showCamera={state.showCamera}
            image={state.image}
            capturedFile={state.capturedFile}
            capturedPreview={state.capturedPreview}
            entityId={aid || ""}
            onCapture={actions.captureImage}
            onReset={actions.resetCamera}
            onProceed={actions.handleProceed}
            onUploadSuccess={actions.onUploadSuccess}
          />
        </div>
      </div>
    </div>
  );
}
