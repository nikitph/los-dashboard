"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DocumentUpload from "./DocumentUpload";
import { getLoanApplicationDocuments } from "@/app/[locale]/saas/(private)/documents/actions";

interface DocumentManagementProps {
  entityType: "loan" | "customer" | "verification";
  entityId: string;
  entityName?: string;
  backUrl?: string;
}

interface DocumentTypeGroup {
  type: string;
  count: number;
  totalSize: number;
}

export default function DocumentManagement({
  entityType,
  entityId,
  entityName = "Entity",
  backUrl,
}: DocumentManagementProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [documentGroups, setDocumentGroups] = useState<DocumentTypeGroup[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, [entityId, entityType]);

  // Process documents to create groupings
  useEffect(() => {
    if (documents.length === 0) {
      setDocumentGroups([]);
      return;
    }

    const groups: Record<string, DocumentTypeGroup> = {};

    // Group documents by type
    documents.forEach((doc) => {
      const type = doc.documentType;
      if (!groups[type]) {
        groups[type] = {
          type,
          count: 0,
          totalSize: 0,
        };
      }
      groups[type].count += 1;
      groups[type].totalSize += doc.size || 0;
    });

    setDocumentGroups(Object.values(groups));
  }, [documents]);

  // Fetch all documents for the entity
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await getLoanApplicationDocuments(entityId);
      if (response.success) {
        setDocuments(response.data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch documents",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Filter documents based on active tab
  const getFilteredDocuments = () => {
    if (activeTab === "all") {
      return documents;
    }
    return documents.filter((doc) => doc.documentType === activeTab);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backUrl && (
            <Button variant="ghost" size="icon" onClick={() => router.push(backUrl)} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">Document Management</h1>
        </div>
        <Button variant="outline" onClick={fetchDocuments}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Document Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Document Overview</CardTitle>
            <CardDescription>
              Documents for {entityName} ({entityType})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Total Documents</span>
                <span className="text-sm font-medium">{documents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Total Size</span>
                <span className="text-sm font-medium">
                  {formatFileSize(documents.reduce((total, doc) => total + (doc.size || 0), 0))}
                </span>
              </div>
              <div className="pt-4">
                <h3 className="mb-2 text-sm font-medium">Document Types</h3>
                <div className="space-y-2">
                  {documentGroups.length === 0 ? (
                    <p className="text-center text-sm text-gray-500">No documents</p>
                  ) : (
                    documentGroups.map((group) => (
                      <div
                        key={group.type}
                        className="flex items-center justify-between rounded-md border border-gray-100 p-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            {group.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {group.count} {group.count === 1 ? "file" : "files"} ({formatFileSize(group.totalSize)})
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload & Management */}
        <div className="md:col-span-2">
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Document Library
                  </CardTitle>
                  <CardDescription>Manage all documents for this {entityType}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                      <p>Loading documents...</p>
                    </div>
                  ) : (
                    <Tabs defaultValue="all">
                      <TabsList className="mb-4 w-full">
                        <TabsTrigger value="all">All</TabsTrigger>
                        {documentGroups.map((group) => (
                          <TabsTrigger key={group.type} value={group.type}>
                            {group.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} ({group.count})
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsContent value="all">
                        <DocumentUpload loanApplicationId={entityId} showUploaded={true} autoUpload={false} />
                      </TabsContent>
                      {documentGroups.map((group) => (
                        <TabsContent key={group.type} value={group.type}>
                          <DocumentUpload
                            loanApplicationId={entityId}
                            allowedTypes={[group.type as any]}
                            showUploaded={true}
                            autoUpload={false}
                          />
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <DocumentUpload
                loanApplicationId={entityId}
                onUploadComplete={() => {
                  fetchDocuments();
                  setActiveTab("all");
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
