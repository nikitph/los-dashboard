"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Trash, Upload } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";

interface MultiImageUploadProps {
  register: any;
  setValue: any;
  watch: any;
  errors: any;
  verificationId: string | null;
  fieldName: string;
  label: string;
  initialUrls?: string[];
  currentUserId: string;
}

export default function MultiImageUpload({
  register,
  setValue,
  watch,
  errors,
  verificationId,
  fieldName,
  label,
  initialUrls = [],
  currentUserId,
}: MultiImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<Array<{ url: string; id?: string }>>([]);

  const { uploadDocument, downloadDocument, removeDocument, formatFileSize, progress } = useDocuments();

  // Initialize with any initial URLs
  useEffect(() => {
    if (initialUrls.length > 0) {
      setImages(initialUrls.map((url) => ({ url })));
      setValue(fieldName, initialUrls.join(","));
    }
  }, [initialUrls, setValue, fieldName]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Remove a selected file (before upload)
  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Remove an uploaded image
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

    // Remove from our local state
    setImages((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    // Update form value
    const updatedUrls = images
      .filter((_, i) => i !== index)
      .map((img) => img.url)
      .join(",");

    setValue(fieldName, updatedUrls);
  };

  // Upload images
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const newImages: Array<{ url: string; id?: string }> = [];

    try {
      for (const file of selectedFiles) {
        // If we have a verification ID, upload to the document system
        if (verificationId) {
          const result = await uploadDocument(file, {
            verificationId,
            documentType: "VERIFICATION_PHOTO",
            uploadedById: currentUserId,
          });

          if (result.success && result.documentId) {
            const url = await downloadDocument(result.documentId);
            if (url) {
              newImages.push({
                url,
                id: result.documentId,
              });
            }
          }
        } else {
          // If no verification ID, create a local object URL
          const objectUrl = URL.createObjectURL(file);
          newImages.push({
            url: objectUrl,
          });

          // Store the actual file to be uploaded later
          // You could add a hidden input or store in form context
          // to access these files when the verification is created
        }
      }

      // Update state with new images
      setImages((prev) => [...prev, ...newImages]);

      // Update form value with all image URLs
      const allUrls = [...images, ...newImages].map((img) => img.url).join(",");
      setValue(fieldName, allUrls);

      // Clear selected files
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={fieldName}>{label}</Label>

        {/* Hidden input for form value */}
        <input type="hidden" id={fieldName} {...register(fieldName)} />

        <div className="flex items-end gap-3">
          {/* File input */}
          <div className="flex-1">
            <Input
              id={`${fieldName}-input`}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          {/* Upload button */}
          <Button type="button" onClick={handleUpload} disabled={selectedFiles.length === 0 || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>

        {errors[fieldName] && <p className="mt-1 text-sm text-red-600">{errors[fieldName].message}</p>}
      </div>

      {/* Selected files (not yet uploaded) */}
      {selectedFiles.length > 0 && (
        <div className="rounded-md border p-4">
          <h4 className="mb-3 font-medium">Selected Files</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative overflow-hidden rounded-md border">
                <div className="group relative aspect-square bg-gray-100">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="ml-auto h-6 w-6"
                      onClick={() => handleRemoveSelectedFile(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-white">{formatFileSize(file.size)}</div>
                  </div>

                  {/* Progress indicator */}
                  {progress[file.name] !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div className="h-full bg-blue-500" style={{ width: `${progress[file.name]}%` }}></div>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-xs">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded images thumbnails */}
      {images.length > 0 && (
        <div className="rounded-md border p-4">
          <h4 className="mb-3 font-medium">Uploaded Images</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-md border">
                <div className="group relative aspect-square bg-gray-100">
                  <img src={image.url} alt={`Image ${index}`} className="h-full w-full object-cover" />

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 flex items-start justify-end bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => window.open(image.url, "_blank")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
