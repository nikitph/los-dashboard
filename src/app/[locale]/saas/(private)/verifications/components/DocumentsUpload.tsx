import React, { useEffect, useRef, useState } from "react";

import { IconButton } from "@/subframe/components/IconButton";
import { Alert } from "@/subframe/components/Alert";
import { ToggleGroup } from "@/subframe/components/ToggleGroup";
import { IconWithBackground } from "@/subframe/components/IconWithBackground";
import { Badge } from "@/subframe/components/Badge";
import { Button } from "@/subframe/components/Button";
import { DocumentInfo, DocumentMetadata, useDocuments } from "@/hooks/useDocuments";
import { useUser } from "@/contexts/userContext";
import { formatDistanceToNow } from "date-fns";

interface DocumentType {
  label: string;
  value: DocumentMetadata["documentType"];
  icon?: string;
}

interface DocumentsUploadProps {
  entityType: string;
  entityId: string;
}

// Main Component
const DocumentsUpload: React.FC<DocumentsUploadProps> = ({ entityType = "loanApplication", entityId = "123" }) => {
  const {
    documents,
    isLoading,
    progress,
    fetchDocuments,
    uploadDocument,
    viewDocument,
    removeDocument,
    formatFileSize,
  } = useDocuments();
  const { user } = useUser();

  const [showAlert, setShowAlert] = useState<boolean>(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, DocumentInfo>>({});
  const [allDocumentsUploaded, setAllDocumentsUploaded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes: DocumentType[] = [
    { label: "Tax Invoice", value: "VEHICLE_TAX_INVOICE", icon: "FeatherFileText" },
    { label: "Delivery Chaalan", value: "VEHICLE_DELIVERY_CHALAN", icon: "FeatherTruck" },
    { label: "Stamped Receipt", value: "VEHICLE_STAMPED_RECEIPT", icon: "FeatherClipboard" },
    { label: "RC", value: "VEHICLE_REGISTRATION_CERTIFICATE", icon: "FeatherFileText" },
    { label: "Inspection Report", value: "VEHICLE_INSPECTION_REPORT", icon: "FeatherCheckSquare" },
    { label: "Vehicle Photo", value: "VEHICLE_PHOTO", icon: "FeatherCamera" },
  ];

  const availableDocumentTypes = documentTypes.filter((docType) => !uploadedDocs[docType.value]);

  useEffect(() => {
    fetchDocuments(entityType, entityId);
  }, [fetchDocuments, entityType, entityId]);

  useEffect(() => {
    // Update uploadedDocs based on fetched documents
    const uploadedDocsMap: Record<string, DocumentInfo> = {};
    documents.forEach((doc) => {
      const docType = documentTypes.find((type) => type.value === doc.documentType);
      if (docType) {
        uploadedDocsMap[docType.value] = doc;
      }
    });
    setUploadedDocs(uploadedDocsMap);

    // Check if all documents are uploaded
    const isAllUploaded = documentTypes.every((docType) => uploadedDocsMap[docType.value]);
    setAllDocumentsUploaded(isAllUploaded);

    // Show success alert if all documents are uploaded
    if (isAllUploaded) {
      setShowSuccessAlert(true);
    }
  }, [documents]);

  const handleDocTypeSelect = (value: string): void => {
    const docType = documentTypes.find((type) => type.value === value);
    if (!docType || uploadedDocs[docType.value]) return; // Already uploaded
    setSelectedDocType(docType);
  };

  const handleUploadClick = (): void => {
    if (!selectedDocType) return;
    fileInputRef.current?.click();
  };

  const handleView = async (documentId: string) => {
    await viewDocument(documentId);
  };

  const handleRemove = async (documentId: string, documentType: string) => {
    const success = await removeDocument(documentId);
    if (success) {
      // Update the local state if needed
      fetchDocuments(entityType, entityId);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocType) return;

    const metadata: DocumentMetadata = {
      documentType: selectedDocType.value,
      loanApplicationId: entityId,
      uploadedById: user?.id || "",
      description: `${selectedDocType.label} document`,
    };

    const result = await uploadDocument(file, metadata);

    if (result.success) {
      // Refresh documents
      fetchDocuments(entityType, entityId);

      // Reset file input
      e.target.value = "";
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <span className="font-body-bold text-body-bold text-default-font">Documents Upload</span>

      {showAlert && !allDocumentsUploaded && (
        <Alert
          title="Select a document type before uploading"
          description="Each document type can only be used once. The tag will be removed after upload."
        />
      )}

      {showSuccessAlert && allDocumentsUploaded && (
        <Alert
          variant="success"
          title="All documents uploaded successfully"
          description="All required documents have been uploaded for this verification."
        />
      )}

      {availableDocumentTypes.length > 0 ? (
        <ToggleGroup
          type="single"
          value={selectedDocType?.value || ""}
          onValueChange={handleDocTypeSelect}
          className={"bg-gray-200"}
        >
          {availableDocumentTypes.map((docType) => (
            <ToggleGroup.Item
              key={docType.value}
              value={docType.value}
              icon={docType.icon || "FeatherFile"}
              className={"w-[150px]"}
            >
              {docType.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      ) : (
        <span className="font-body-bold text-success-500">All document types have been uploaded</span>
      )}

      {!allDocumentsUploaded && (
        <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-1 py-1">
          <div className="flex w-full items-center gap-4 px-2 py-2">
            <IconWithBackground variant="neutral" size="large" icon="FeatherUpload" />
            <div className="flex shrink-0 grow basis-0 flex-col items-start justify-center gap-1">
              <span className="w-full font-body-bold text-body-bold text-default-font">Upload Document</span>
              <span className="w-full font-body text-body text-subtext-color">
                {selectedDocType
                  ? `Ready to upload ${selectedDocType.label}`
                  : "Select a document type and click upload"}
              </span>
            </div>
            <Button onClick={handleUploadClick} disabled={!selectedDocType}>
              Upload
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </div>
        </div>
      )}
      {/* This section is where uploaded documents are displayed */}
      {/* Each uploaded document shows its type, upload time, and file size */}
      <div className="grid w-full grid-cols-2 gap-4">
        {Object.entries(uploadedDocs).map(([docTypeValue, doc]) => {
          const docType = documentTypes.find((type) => type.value === docTypeValue);
          return (
            <div
              key={doc.id}
              className="flex flex-col items-start rounded-md border border-solid border-neutral-200 bg-white p-3 shadow-sm"
            >
              <div className="flex w-full items-center gap-3">
                <IconWithBackground variant="success" size="small" icon="FeatherFile" />
                <div className="flex flex-grow flex-col">
                  <span className="font-body-bold text-body-bold text-default-font">
                    {docType?.label || doc.documentType}
                  </span>
                  <span className="text-xs text-subtext-color">
                    Uploaded {formatDistanceToNow(doc.uploadedAt, { addSuffix: true })} • {formatFileSize(doc.fileSize)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <IconButton
                    icon="FeatherEye"
                    size="small"
                    variant="ghost"
                    onClick={() => handleView(doc.id)}
                    title="View Document"
                  />
                  <IconButton
                    icon="FeatherTrash"
                    size="small"
                    variant="ghost"
                    onClick={() => handleRemove(doc.id, doc.documentType)}
                    title="Remove Document"
                  />
                  <Badge variant="success" icon="FeatherCheck">
                    Uploaded
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsUpload;
