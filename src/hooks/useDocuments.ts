"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  confirmDocumentUpload,
  deleteDocument,
  getDocumentDownloadUrl,
  getDocumentsByEntity,
  getDocumentUploadUrl,
  getLoanApplicationDocuments,
} from "@/app/[locale]/saas/(private)/documents/actions";
import { validateFile } from "@/lib/backblaze/backblazeUtils";

export type DocumentMetadata = {
  // Entity-related fields
  loanApplicationId?: string;
  applicantId?: string;
  verificationId?: string;
  coApplicantId?: string;
  guarantorId?: string;
  incomeId?: string;
  incomeDetailId?: string;
  dependentId?: string;
  loanObligationId?: string;
  loanObligationDetailId?: string;
  bankId?: string;
  subscriptionId?: string;
  bankConfigurationId?: string;

  // Document properties
  documentType:
    | "AADHAAR_CARD"
    | "PAN_CARD"
    | "IDENTITY_PROOF"
    | "ADDRESS_PROOF"
    | "INCOME_PROOF"
    | "BANK_STATEMENT"
    | "PROPERTY_DOCUMENT"
    | "VEHICLE_DOCUMENT"
    | "LOAN_AGREEMENT"
    | "VERIFICATION_PHOTO"
    | "KYC_DOCUMENT"
    | "APPLICATION_FORM"
    | "APPLICANT_PHOTO"
    | "VEHICLE_PHOTO"
    | "PROPERTY_PHOTO"
    | "BUSINESS_PHOTO"
    | "VEHICLE_REGISTRATION_CERTIFICATE"
    | "VEHICLE_INSPECTION_REPORT"
    | "VEHICLE_STAMPED_RECEIPT"
    | "VEHICLE_TAX_INVOICE"
    | "VEHICLE_DELIVERY_CHALAN"
    | "OTHER";
  description?: string;
  uploadedById: string;
};

export type DocumentInfo = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  documentType: string;
  fileUrl: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  metadata: any;
  uploadedById: string;
  uploadedAt: Date;
  deletedAt: Date | null;
};

/**
 * Custom hook for document operations
 */
export function useDocuments() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);

  /**
   * Fetch all documents for an entity
   */
  const fetchDocuments = useCallback(
    async (entityType: string, entityId: string): Promise<DocumentInfo[]> => {
      setIsLoading(true);
      try {
        let response;

        // Use the appropriate API based on entity type
        if (entityType === "loanApplication") {
          response = await getLoanApplicationDocuments(entityId);
        } else {
          response = await getDocumentsByEntity(entityType, entityId);
        }

        if (response.success) {
          setDocuments(response.data);
          return response.data;
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch documents",
            variant: "destructive",
          });
          return [];
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  /**
   * Upload a single file with progress tracking
   */
  const uploadDocument = useCallback(
    async (file: File, metadata: DocumentMetadata): Promise<{ success: boolean; documentId?: string }> => {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid file",
          description: validation.message,
          variant: "destructive",
        });
        return { success: false };
      }

      try {
        // Reset progress
        setProgress((prev) => ({ ...prev, [file.name]: 0 }));

        // Get upload URL
        const response = await getDocumentUploadUrl({
          ...metadata,
          mimeType: file.type,
          fileName: file.name,
          fileSize: file.size,
        });

        if (!response.success) {
          toast({
            title: "Error",
            description: response.message || "Failed to generate upload URL",
            variant: "destructive",
          });
          return { success: false };
        }

        const { uploadUrl, documentId, fileKey } = response.data;

        // Upload file with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setProgress((prev) => ({ ...prev, [file.name]: percentComplete }));
            }
          });

          xhr.open("PUT", uploadUrl, true);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error occurred during upload"));
          };

          xhr.send(file);
        });

        // Confirm upload with server
        const confirmResponse = await confirmDocumentUpload(documentId, file.size);

        if (confirmResponse.success) {
          return { success: true, documentId };
        } else {
          toast({
            title: "Error",
            description: "File uploaded but failed to confirm with server",
            variant: "destructive",
          });
          return { success: false };
        }
      } catch (error) {
        console.error("Error uploading document:", error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        return { success: false };
      } finally {
        // Clear progress after completion
        setTimeout(() => {
          setProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 1000);
      }
    },
    [toast],
  );

  /**
   * Upload multiple files
   */
  const uploadDocuments = useCallback(
    async (files: File[], metadata: DocumentMetadata): Promise<string[]> => {
      setIsLoading(true);
      const successfulDocumentIds: string[] = [];

      try {
        for (const file of files) {
          const result = await uploadDocument(file, metadata);
          if (result.success && result.documentId) {
            successfulDocumentIds.push(result.documentId);
          }
        }

        if (successfulDocumentIds.length > 0) {
          toast({
            title: "Upload Complete",
            description: `Successfully uploaded ${successfulDocumentIds.length} ${successfulDocumentIds.length === 1 ? "file" : "files"}`,
          });
        }

        return successfulDocumentIds;
      } catch (error) {
        console.error("Error uploading documents:", error);
        toast({
          title: "Upload Failed",
          description: "An error occurred while uploading files",
          variant: "destructive",
        });
        return successfulDocumentIds;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, uploadDocument],
  );

  /**
   * Get a download URL for a document
   */
  const downloadDocument = useCallback(
    async (documentId: string): Promise<string | null> => {
      try {
        const response = await getDocumentDownloadUrl(documentId);

        if (response.success) {
          return response.data.downloadUrl;
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to generate download URL",
            variant: "destructive",
          });
          return null;
        }
      } catch (error) {
        console.error("Error downloading document:", error);
        toast({
          title: "Error",
          description: "Failed to download document",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast],
  );

  /**
   * View a document (opens in a new tab)
   */
  const viewDocument = useCallback(
    async (documentId: string): Promise<void> => {
      const url = await downloadDocument(documentId);
      if (url) {
        window.open(url, "_blank");
      }
    },
    [downloadDocument],
  );

  /**
   * Delete a document
   */
  const removeDocument = useCallback(
    async (documentId: string, confirmDelete = true): Promise<boolean> => {
      try {
        const response = await deleteDocument(documentId);

        if (response.success) {
          toast({
            title: "Success",
            description: "Document deleted successfully",
          });

          // Update local state
          setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

          return true;
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete document",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        console.error("Error deleting document:", error);
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast],
  );

  /**
   * Format file size for display
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  return {
    documents,
    isLoading,
    progress,
    fetchDocuments,
    uploadDocument,
    uploadDocuments,
    downloadDocument,
    viewDocument,
    removeDocument,
    formatFileSize,
  };
}
