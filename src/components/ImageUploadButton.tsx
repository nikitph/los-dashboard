import { useEffect, useState } from "react";
import { Eye, Loader2, X } from "lucide-react";
import { DocumentMetadata, useDocuments } from "@/hooks/useDocuments";
import { Dialog } from "@/components/subframe/ui";

interface ImageUploadButtonProps {
  documentType: DocumentMetadata["documentType"];
  entityType: string;
  entityId: string;
  description?: string;
  uploadedById: string;
  onUploadSuccess?: (documentId: string) => void;
  file: File | null;
  filePreviewUrl?: string | null;
  onRemove?: () => void;
}

const ImageUploadButton = ({
  documentType,
  entityType,
  entityId,
  description = "",
  uploadedById,
  onUploadSuccess,
  file,
  filePreviewUrl = null,
  onRemove,
}: ImageUploadButtonProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const { uploadDocument, viewDocument, removeDocument, progress } = useDocuments();

  // Process the file when it changes
  useEffect(() => {
    if (file) {
      // Use provided preview URL or create one
      if (filePreviewUrl) {
        setImagePreview(filePreviewUrl);
      } else if (!imagePreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Start upload if file is valid and not already uploading
      if (!isUploading && validateFile(file)) {
        handleUpload(file);
      }
    } else {
      // Clear state when file is removed
      setImagePreview(null);
    }
  }, [file, filePreviewUrl]);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Add any validation logic you need here
    // For example, check file size or type
    // This is simplified since you're handling the file externally

    return true;
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const metadata: DocumentMetadata = {
      documentType,
      description,
      uploadedById,
    };

    // Add the appropriate entity ID field based on entityType
    switch (entityType) {
      case "loanApplication":
        metadata.loanApplicationId = entityId;
        break;
      case "applicant":
        metadata.applicantId = entityId;
        break;
      case "coApplicant":
        metadata.coApplicantId = entityId;
        break;
      // Include all other entity types
      case "verification":
        metadata.verificationId = entityId;
        break;
      case "guarantor":
        metadata.guarantorId = entityId;
        break;
      case "income":
        metadata.incomeId = entityId;
        break;
      case "incomeDetail":
        metadata.incomeDetailId = entityId;
        break;
      case "dependent":
        metadata.dependentId = entityId;
        break;
      case "loanObligation":
        metadata.loanObligationId = entityId;
        break;
      case "loanObligationDetail":
        metadata.loanObligationDetailId = entityId;
        break;
      case "bank":
        metadata.bankId = entityId;
        break;
      case "subscription":
        metadata.subscriptionId = entityId;
        break;
      case "bankConfiguration":
        metadata.bankConfigurationId = entityId;
        break;
    }

    try {
      const result = await uploadDocument(file, metadata);

      if (result.success && result.documentId) {
        setDocumentId(result.documentId);
        if (onUploadSuccess) {
          onUploadSuccess(result.documentId);
        }
      } else {
        setError("Upload failed");
      }
    } catch (err) {
      setError("Upload error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRemoveDialog(true);
  };

  const handleConfirmRemove = async () => {
    if (documentId) {
      const success = await removeDocument(documentId, true);
      if (success) {
        setDocumentId(null);
        setImagePreview(null);

        // Call parent's onRemove if provided
        if (onRemove) {
          onRemove();
        }
      }
    }
    setShowRemoveDialog(false);
  };

  const handleCancelRemove = () => {
    setShowRemoveDialog(false);
  };

  const handleView = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (documentId) {
      await viewDocument(documentId);
    } else if (imagePreview) {
      window.open(imagePreview, "_blank");
    }
  };

  const fileProgress = file ? progress[file.name] || 0 : 0;

  // If no file, don't render anything
  if (!file) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-between rounded-md border border-gray-300 py-[5px] pl-4 pr-2 text-sm font-medium shadow-sm`}
        >
          <span className="max-w-[150px] truncate">{file.name}</span>
          <div className="ml-2 flex items-center">
            {isUploading ? (
              <div className="flex items-center space-x-2 py-[4px]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">{fileProgress}%</span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleView}
                  className="rounded-full p-1 hover:bg-gray-200"
                  title="View Image"
                  type="button"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={handleRemoveClick}
                  className="ml-1 rounded-full p-1 hover:bg-gray-200"
                  title="Remove image"
                  type="button"
                >
                  <X size={16} />
                </button>
              </>
            )}
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <Dialog.Content>
          <div className="p-6">
            <h2 className="mb-2 text-lg font-semibold">Remove Document</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to remove {file?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelRemove}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default ImageUploadButton;
