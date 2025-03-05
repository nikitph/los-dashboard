"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye, Loader2, Trash, Upload } from "lucide-react";
import { validateFile } from "@/utils/backblaze/backblazeUtils";
import {
  confirmDocumentUpload,
  deleteDocument,
  getDocumentDownloadUrl,
  getDocumentUploadUrl,
  getLoanApplicationDocuments,
} from "@/app/saas/(private)/documents/actions";

interface DocumentUploadProps {
  loanApplicationId: string;
  allowedTypes?: Array<
    "identification" | "income_proof" | "property_document" | "agreement" | "verification_report" | "other"
  >;
  maxFiles?: number;
  autoUpload?: boolean;
  onUploadComplete?: (documentIds: string[]) => void;
  showUploaded?: boolean;
}

interface Document {
  id: string;
  loanApplicationId: string;
  documentType: string;
  fileUrl: string;
  storageType: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  metadata: any;
  uploadedAt: Date;
  deletedAt?: Date;
}

export default function DocumentUpload({
  loanApplicationId,
  allowedTypes = ["identification", "income_proof", "property_document", "agreement", "verification_report", "other"],
  maxFiles = 10,
  autoUpload = true,
  onUploadComplete,
  showUploaded = true,
}: DocumentUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [documentType, setDocumentType] = useState<string>(allowedTypes[0]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [additionalMetadata, setAdditionalMetadata] = useState<Record<string, string>>({});

  // Load existing documents when component mounts
  useEffect(() => {
    if (showUploaded && loanApplicationId) {
      fetchDocuments();
    }
  }, [loanApplicationId, showUploaded]);

  // Fetch loan application documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await getLoanApplicationDocuments(loanApplicationId);
      if (response.success) {
        setDocuments(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load documents",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate file count
    if (uploadingFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum of ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    // Add files to state
    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type and size
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid file",
          description: validation.message,
          variant: "destructive",
        });
        continue;
      }

      newFiles.push(file);
    }

    setUploadingFiles([...uploadingFiles, ...newFiles]);

    // Auto upload if enabled
    if (autoUpload && newFiles.length > 0) {
      handleUpload([...uploadingFiles, ...newFiles]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove file from upload list
  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadingFiles];
    newFiles.splice(index, 1);
    setUploadingFiles(newFiles);
  };

  // Add metadata field
  const handleAddMetadataField = () => {
    setAdditionalMetadata((prev) => ({
      ...prev,
      [`field_${Object.keys(prev).length + 1}`]: "",
    }));
  };

  // Update metadata field value
  const handleMetadataChange = (key: string, value: string) => {
    setAdditionalMetadata((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Remove metadata field
  const handleRemoveMetadataField = (key: string) => {
    setAdditionalMetadata((prev) => {
      const newMetadata = { ...prev };
      delete newMetadata[key];
      return newMetadata;
    });
  };

  // Upload files to Backblaze
  const handleUpload = async (filesToUpload = uploadingFiles) => {
    if (filesToUpload.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    if (!loanApplicationId) {
      loanApplicationId = "57c45179-ecb0-4b9b-b1a1-28e4d4ef6514";
      toast({
        title: "Error",
        description: "Loan application ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const successfulDocumentIds: string[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Update progress
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        // Prepare metadata
        const metadata = {
          ...additionalMetadata,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          uploadedAt: new Date().toISOString(),
        };

        // Get presigned upload URL
        const response = await getDocumentUploadUrl({
          loanApplicationId,
          documentType: documentType as any,
          contentType: file.type,
          fileName: file.name,
          metadata,
        });

        if (!response.success) {
          toast({
            title: "Error",
            description: response.message || "Failed to generate upload URL",
            variant: "destructive",
          });
          continue;
        }

        const { uploadUrl, documentId, fileKey } = response.data;

        // Upload file directly to Backblaze using the presigned URL
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) => ({ ...prev, [file.name]: percentComplete }));
          }
        });

        await new Promise<void>((resolve, reject) => {
          xhr.open("PUT", uploadUrl, true);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.setRequestHeader("x-amz-acl", "private");

          xhr.onload = async () => {
            if (xhr.status === 200) {
              // Confirm upload completion on the server
              const confirmResponse = await confirmDocumentUpload(documentId, file.size);

              if (confirmResponse.success) {
                successfulDocumentIds.push(documentId);
                resolve();
              } else {
                toast({
                  title: "Error",
                  description: "File uploaded but failed to confirm with server",
                  variant: "destructive",
                });
                reject(new Error("Failed to confirm upload"));
              }
            } else {
              toast({
                title: "Upload Failed",
                description: `Failed to upload ${file.name}`,
                variant: "destructive",
              });
              reject(new Error("Upload failed"));
            }
          };

          xhr.onerror = () => {
            toast({
              title: "Upload Failed",
              description: `Failed to upload ${file.name}`,
              variant: "destructive",
            });
            reject(new Error("Upload failed"));
          };

          xhr.send(file);
        });
      }

      // Clear files after successful upload
      setUploadingFiles([]);
      setUploadProgress({});
      setAdditionalMetadata({});

      // Call the onUploadComplete callback if provided
      if (onUploadComplete && successfulDocumentIds.length > 0) {
        onUploadComplete(successfulDocumentIds);
      }

      // Refresh the document list
      if (showUploaded) {
        fetchDocuments();
      }

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successfulDocumentIds.length} ${successfulDocumentIds.length === 1 ? "file" : "files"}`,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document download
  const handleDownload = async (documentId: string) => {
    try {
      const response = await getDocumentDownloadUrl(documentId);

      if (response.success) {
        // Open download URL in new tab
        window.open(response.data.downloadUrl, "_blank");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to generate download URL",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await deleteDocument(documentId);

      if (response.success) {
        // Update the document list
        if (showUploaded) {
          fetchDocuments();
        }

        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete document",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file size from document metadata
  const getDocumentSize = (document: Document): number => {
    return document.metadata?.size || 0;
  };

  // Get file name from document metadata
  const getDocumentFileName = (document: Document): string => {
    return document.metadata?.fileName || "Unknown file";
  };

  // Format verification status
  const formatVerificationStatus = (status: string): JSX.Element => {
    switch (status) {
      case "VERIFIED":
        return <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Verified</span>;
      case "REJECTED":
        return <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">Rejected</span>;
      default:
        return <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>Upload documents for loan application {loanApplicationId.slice(0, 8)}...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {allowedTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Metadata Fields */}
          {Object.keys(additionalMetadata).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Additional Metadata</Label>
              </div>
              {Object.entries(additionalMetadata).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Input placeholder="Field name" value={key} disabled className="w-1/3" />
                  <Input
                    placeholder="Value"
                    value={value}
                    onChange={(e) => handleMetadataChange(key, e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMetadataField(key)}
                    disabled={isLoading}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="button" variant="outline" size="sm" onClick={handleAddMetadataField} disabled={isLoading}>
            Add Metadata Field
          </Button>

          <div className="flex flex-col space-y-4 pt-4">
            <Label htmlFor="file">Select Files</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
              {uploadingFiles.length > 0 && !autoUpload && (
                <Button type="button" onClick={() => handleUpload()} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload ({uploadingFiles.length})
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Display selected files */}
            {uploadingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">Selected Files:</h3>
                <div className="space-y-2">
                  {uploadingFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-md border border-gray-200 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {uploadProgress[file.name] !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{uploadProgress[file.name]}%</span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isLoading}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleUpload()} disabled={isLoading || uploadingFiles.length === 0} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Display uploaded documents if showUploaded is true */}
      {showUploaded && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>Manage documents for this loan application</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : documents.length === 0 ? (
              <div className="py-6 text-center text-gray-500">No documents uploaded yet</div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-md border border-gray-200 p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getDocumentFileName(doc)}</span>
                        {formatVerificationStatus(doc.verificationStatus)}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="mr-2 rounded bg-gray-100 px-2 py-1 text-xs">
                          {doc.documentType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <span>{formatFileSize(getDocumentSize(doc))}</span>
                        <span className="ml-2 text-xs">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.id)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {(doc.metadata?.contentType?.startsWith("image/") ||
                        doc.metadata?.contentType === "application/pdf") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.id)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        title="Delete"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="button" variant="outline" onClick={fetchDocuments}>
              Refresh
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
