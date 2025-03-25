"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, FileText, Trash, Upload } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { getCoApplicantById } from "@/app/saas/(private)/co-applicants/actions";
import { useUser } from "@/contexts/userContext";

interface CoApplicantDocumentsProps {
  coApplicantId: string;
}

export default function CoApplicantDocuments({ coApplicantId }: CoApplicantDocumentsProps) {
  const [coApplicant, setCoApplicant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<any>("IDENTITY_PROOF");
  const [description, setDescription] = useState("");
  const { user } = useUser();

  const {
    documents,
    progress,
    isLoading: isLoadingDocuments,
    fetchDocuments,
    uploadDocument,
    viewDocument,
    removeDocument,
    formatFileSize,
  } = useDocuments();

  // Fetch co-applicant details
  useEffect(() => {
    const fetchCoApplicant = async () => {
      try {
        const response = await getCoApplicantById(coApplicantId);
        if (response.success) {
          setCoApplicant(response.data);
        }
      } catch (error) {
        console.error("Error fetching co-applicant:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoApplicant();
  }, [coApplicantId]);

  // Fetch documents when component mounts
  useEffect(() => {
    if (coApplicant) {
      // First try to fetch documents specific to this co-applicant
      fetchDocuments("coApplicant", coApplicantId);
    }
  }, [coApplicant, coApplicantId, fetchDocuments]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !coApplicant) return;

    // Get the current user ID (you might need to adjust this based on your auth system)
    const uploadedById = user?.id ?? ""; // Replace with actual user ID retrieval

    const result = await uploadDocument(selectedFile, {
      coApplicantId: coApplicantId,
      documentType: documentType,
      uploadedById: uploadedById,
    });

    if (result.success) {
      setUploadResult(`File uploaded successfully!`);
      setSelectedFile(null);
      setDescription("");
      fetchDocuments("coApplicant", coApplicantId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p>Loading co-applicant information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!coApplicant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p>Co-applicant not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Co-Applicant Documents</CardTitle>
        <CardDescription>
          Manage documents for {coApplicant.firstName} {coApplicant.lastName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoadingDocuments ? (
              <div className="flex h-40 items-center justify-center">
                <p>Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <p>No documents found. Upload a document to get started.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-md border p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium">{doc.fileName}</h4>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="mr-2 rounded bg-gray-100 px-2 py-1 text-xs">
                          {doc.documentType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        {doc.metadata?.description && <span className="ml-2">- {doc.metadata.description}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => viewDocument(doc.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeDocument(doc.id)}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Document Type</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="IDENTITY_PROOF">Identity Proof</option>
                  <option value="AADHAAR_CARD">Aadhaar Card</option>
                  <option value="PAN_CARD">PAN Card</option>
                  <option value="ADDRESS_PROOF">Address Proof</option>
                  <option value="INCOME_PROOF">Income Proof</option>
                  <option value="BANK_STATEMENT">Bank Statement</option>
                  <option value="PROPERTY_DOCUMENT">Property Document</option>
                  <option value="LOAN_AGREEMENT">Loan Agreement</option>
                  <option value="KYC_DOCUMENT">KYC Document</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter document description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Select File</label>
                <input
                  type="file"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileChange}
                />
              </div>

              {selectedFile && (
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">{selectedFile.name}</h3>
                      <div className="mt-1 text-sm text-blue-700">{formatFileSize(selectedFile.size)}</div>
                      {progress[selectedFile.name] !== undefined && (
                        <div className="mt-2">
                          <div className="h-2 w-full rounded-full bg-blue-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${progress[selectedFile.name]}%` }}
                            ></div>
                          </div>
                          <p className="mt-1 text-xs text-blue-700">{progress[selectedFile.name]}% uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handleUpload} disabled={!selectedFile} className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>

              {/* Success Message */}
              {uploadResult && (
                <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {uploadResult}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
