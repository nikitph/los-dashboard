"use client";

import React, { useEffect, useState } from "react";
import { DialogLayout } from "@/subframe/layouts/DialogLayout";
import { Button } from "@/subframe/components/Button";
import { Badge } from "@/subframe/components/Badge";
import { IconButton } from "@/subframe/components/IconButton";
import * as SubframeCore from "@subframe/core";
import { useDocuments } from "@/hooks/useDocuments";

// Types
interface EnhancedImageUploaderProps {
  register?: any;
  setValue?: any;
  watch?: any;
  errors?: any;
  verificationId?: string | null | undefined;
  fieldName?: string;
  label?: string;
  initialUrls?: string[];
  currentUserId?: string | undefined;
  isDialogMode?: boolean;
  onCancel?: () => void;
  onComplete?: (urls: string[]) => void;
}

interface ImageItem {
  url: string;
  id?: string;
  status?: "uploading" | "complete" | "failed" | "pending upload";
  progress?: number;
  file?: File;
}

// File preview component
const FilePreview = ({
  image,
  onRemove,
  progress,
}: {
  image: ImageItem;
  onRemove: () => void;
  progress?: Record<string, number>;
}) => {
  // Determine badge variant and text based on status
  let badgeVariant = "success";
  let badgeText = "Complete";
  // @ts-ignore
  const percent = progress && image.file?.name ? progress[image.file.name] : 0;

  if (image.status === "pending upload") {
    badgeVariant = "warning";
    badgeText = "Pending Upload";
  } else if (image.status === "uploading") {
    badgeText = `Uploading ${percent}%`;
  } else if (image.status === "failed") {
    badgeVariant = "error";
    badgeText = "Failed";
  }

  return (
    <div className="flex flex-col items-start gap-2 rounded-md bg-neutral-50 px-2 py-2">
      <img className="h-32 w-32 flex-none rounded-md object-cover" src={image.url} alt="Preview" />
      <div className="flex w-full items-center gap-2">
        <Badge variant={badgeVariant}>{badgeText}</Badge>
        <IconButton size="small" icon="FeatherX" onClick={onRemove} />
      </div>
    </div>
  );
};

export default function EnhancedImageUploader({
  register,
  setValue,
  watch,
  errors,
  verificationId,
  fieldName = "images",
  label = "Upload Images",
  initialUrls = [],
  currentUserId,
  isDialogMode = false,
  onCancel = () => {},
  onComplete = () => {},
}: EnhancedImageUploaderProps) {
  // State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Custom hooks
  const { uploadDocument, downloadDocument, removeDocument, formatFileSize, progress } = useDocuments();

  console.log("progress", progress);

  // Effects
  useEffect(() => {
    if (initialUrls.length > 0) {
      setImages(initialUrls.map((url) => ({ url, status: "complete" })));
      if (setValue) {
        setValue(fieldName, initialUrls.join(","));
      }
    }
  }, [initialUrls, setValue, fieldName]);

  useEffect(() => {
    setIsDialogOpen(isDialogMode);
  }, [isDialogMode]);

  // File handling methods
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));

      if (newFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...newFiles]);

        // Create temporary preview items
        const newTempImages = newFiles.map((file) => ({
          url: URL.createObjectURL(file),
          status: "pending upload" as const,
          progress: 0,
          file,
        }));

        setImages((prev) => [...prev, ...newTempImages]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      // Create temporary preview items
      const newTempImages = newFiles.map((file) => ({
        url: URL.createObjectURL(file),
        status: "pending upload" as const,
        progress: 0,
        file,
      }));

      setImages((prev) => [...prev, ...newTempImages]);
    }
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = async (index: number) => {
    const image = images[index];

    // If the image has an ID and verification ID, it's in the document system
    if (image.id && verificationId) {
      try {
        await removeDocument(image.id);
      } catch (error) {
        console.error("Error removing document:", error);
      }
    }

    // Revoke object URL if it's a temporary preview
    if (image.file) {
      URL.revokeObjectURL(image.url);
    }

    // Remove from our local state and update form value
    setImages((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);

      // Update form value if using with a form
      if (setValue) {
        const updatedUrls = updated
          .filter((img) => img.status === "complete")
          .map((img) => img.url)
          .join(",");
        setValue(fieldName, updatedUrls);
      }

      return updated;
    });
  };

  // Upload functionality
  // Inside your handleUploadAll function, replace the upload loop with this corrected version

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const uploadPromises = [];
    const updatedImages = [...images];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const imageIndex = images.findIndex((img) => img.file === file);

        if (imageIndex === -1) continue;

        // Update status to uploading
        setImages((prev) => {
          const updated = [...prev];
          if (updated[imageIndex]) {
            updated[imageIndex].status = "uploading";
            updated[imageIndex].progress = 0;
          }
          return updated;
        });

        const uploadPromise = await (async () => {
          try {
            if (verificationId) {
              const result = await uploadDocument(file, {
                verificationId,
                documentType: "VERIFICATION_PHOTO",
                uploadedById: currentUserId || "",
              });

              if (result.success && result.documentId) {
                const url = await downloadDocument(result.documentId);
                if (url) {
                  updatedImages[imageIndex] = {
                    url,
                    id: result.documentId,
                    status: "complete",
                    progress: 100,
                  };
                }
              }
            }
          } catch (error) {
            console.error("Error uploading file:", error);
            updatedImages[imageIndex].status = "failed";
          }
        })();

        uploadPromises.push(uploadPromise);
      }

      await Promise.all(uploadPromises);

      // Update state with processed images
      setImages(updatedImages);

      // Update form value if using with a form
      if (setValue) {
        const allUrls = updatedImages
          .filter((img) => img.status === "complete")
          .map((img) => img.url)
          .join(",");
        setValue(fieldName, allUrls);
      }

      // Clear selected files
      setSelectedFiles([]);

      // Call onComplete callback with array of successfully uploaded URLs
      const successfulUrls = updatedImages.filter((img) => img.status === "complete").map((img) => img.url);
      onComplete(successfulUrls);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    // Clean up any object URLs
    images.forEach((image) => {
      if (image.file) {
        URL.revokeObjectURL(image.url);
      }
    });

    // Reset state
    setSelectedFiles([]);
    setImages(initialUrls.map((url) => ({ url, status: "complete" })));

    // Call cancel callback
    onCancel();

    // Close dialog if in dialog mode
    if (isDialogMode) {
      setIsDialogOpen(false);
    }
  };

  // The main content of the uploader
  const uploaderContent = (
    <div className="flex h-full w-full flex-col items-start gap-6 bg-default-background px-2 py-6">
      <div className="flex w-full items-center gap-2">
        <div className="flex shrink-0 grow basis-0 flex-col items-start gap-1">
          <span className="font-heading-3 text-heading-3 text-default-font">{label}</span>
          <span className="font-body text-body text-subtext-color">Select multiple files to upload</span>
        </div>
        <Button variant="neutral-tertiary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleUploadAll} disabled={selectedFiles.length === 0 || isUploading}>
          Upload All
        </Button>
      </div>

      <div className="flex w-full flex-col items-start rounded-md border border-solid border-neutral-border bg-default-background shadow-sm">
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-6 py-6">
          <span className="font-heading-3 text-heading-3 text-default-font">Selected Files</span>
          <span className="font-body text-body text-subtext-color">JPG, PNG up to 10MB each</span>
        </div>

        <div className="flex w-full flex-col items-start gap-4 px-6 py-6">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="hidden"
            id={fieldName}
            name={fieldName}
            {...(register ? register(fieldName) : {})}
          />

          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />

          {/* Drag and drop area */}
          <div
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-brand-600 px-6 py-6"
            onClick={handleBrowseFiles}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <SubframeCore.Icon className="font-heading-1 text-heading-1 text-brand-700" name="FeatherUploadCloud" />
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-center font-body text-body text-default-font">
                Drag and drop files here or click to browse
              </span>
              <span className="text-center font-caption text-caption text-subtext-color">
                You can upload up to 10 files at once
              </span>
            </div>
          </div>

          {/* Error message if any */}
          {errors && errors[fieldName] && <p className="text-sm text-red-600">{errors[fieldName].message}</p>}

          {/* Preview of selected/uploaded files */}
          {images.length > 0 && (
            <div className="flex w-full flex-wrap items-start gap-4">
              {images.map((image, index) => (
                <FilePreview key={index} image={image} onRemove={() => handleRemoveImage(index)} progress={progress} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render based on mode (dialog or inline)
  if (isDialogMode) {
    return (
      <DialogLayout open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {uploaderContent}
      </DialogLayout>
    );
  }

  return uploaderContent;
}
