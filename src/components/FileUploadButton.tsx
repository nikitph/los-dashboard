import { useRef, useState } from "react";
import { Eye, Loader2, Upload, X } from "lucide-react";
import { DocumentMetadata, useDocuments } from "@/hooks/useDocuments";

interface FileUploadButtonProps {
  documentType: DocumentMetadata["documentType"];
  entityType: string;
  entityId: string;
  description?: string;
  uploadedById: string;
  onUploadSuccess?: (documentId: string) => void;
  title?: string;
}

const FileUploadButton = ({
  documentType,
  entityType,
  entityId,
  description = "",
  uploadedById,
  onUploadSuccess,
  title = "Document",
}: FileUploadButtonProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadDocument, viewDocument, removeDocument, progress } = useDocuments();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);

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

    const result = await uploadDocument(file, metadata);
    setIsUploading(false);

    if (result.success && result.documentId) {
      setDocumentId(result.documentId);
      if (onUploadSuccess) {
        onUploadSuccess(result.documentId);
      }
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (documentId) {
      const success = await removeDocument(documentId, true);
      if (success) {
        setSelectedFile(null);
        setDocumentId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      // If no documentId yet (file selected but not uploaded), just clear it
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (documentId) {
      await viewDocument(documentId);
    } else if (selectedFile) {
      // Local preview if file exists but hasn't been uploaded yet
      const fileURL = URL.createObjectURL(selectedFile);
      window.open(fileURL, "_blank");
    }
  };

  const fileProgress = selectedFile ? progress[selectedFile.name] || 0 : 0;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="relative">
        <input
          type="file"
          className="sr-only"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          disabled={isUploading}
        />
        {!selectedFile ? (
          <button
            onClick={handleClick}
            className="flex max-w-[200px] items-center justify-center rounded-md border bg-primary px-4 py-[7px] text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            disabled={isUploading}
            type={"button"}
          >
            <Upload size={16} className="mr-2" />
            Upload {title}
          </button>
        ) : (
          <div
            onClick={isUploading ? undefined : handleClick}
            className={`flex items-center justify-between rounded-md border border-gray-300 py-[5px] pl-4 pr-2 text-sm font-medium shadow-sm ${!isUploading ? "cursor-pointer hover:bg-gray-50" : ""}`}
          >
            <span className="max-w-[150px] truncate">{selectedFile.name}</span>
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
                    title="View PDF"
                    type={"button"}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={handleRemove}
                    className="ml-1 rounded-full p-1 hover:bg-gray-200"
                    title="Remove file"
                    type={"button"}
                  >
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadButton;
