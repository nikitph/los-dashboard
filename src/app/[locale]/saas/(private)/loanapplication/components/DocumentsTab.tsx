"use client";

import React, { useEffect, useState } from "react";
import { Table } from "@/subframe/components/Table";
import { IconWithBackground } from "@/subframe/components/IconWithBackground";
import { Badge } from "@/subframe/components/Badge";
import { Avatar } from "@/subframe/components/Avatar";
import { IconButton } from "@/subframe/components/IconButton";
import { DocumentType } from "@prisma/client";
import { getLoanApplicationDocuments } from "@/app/[locale]/saas/(private)/documents/actions";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/userContext";
import SimpleFileUploadButton from "@/components/ui/SimpleFileUploadButton";
import { useDocuments } from "@/hooks/useDocuments";

export const DocumentsTab = ({ loanApplicationId }: { loanApplicationId: string }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<DocumentType>("AADHAAR_CARD");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { viewDocument } = useDocuments();

  useEffect(() => {
    fetchDocuments();
  }, [loanApplicationId]);

  const handleView = async (documentId: string) => {
    if (documentId) {
      await viewDocument(documentId);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await getLoanApplicationDocuments(loanApplicationId);
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

  console.log("Documents:", documents);

  const formatDocumentType = (type: DocumentType) =>
    type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/(^|\s)\S/g, (l) => l.toUpperCase());

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="w-56">
          <label className="mb-1 block text-sm font-medium text-gray-700">Document Type</label>
          <Select value={selectedType} onValueChange={(val) => setSelectedType(val as DocumentType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(DocumentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {formatDocumentType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SimpleFileUploadButton
          documentType={selectedType}
          entityType="loanApplication"
          entityId={loanApplicationId}
          uploadedById={user?.id}
          onUploadSuccess={fetchDocuments}
          title={"Document"}
        />
      </div>

      <Table
        header={
          <Table.HeaderRow>
            <Table.HeaderCell>Document</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Uploaded by</Table.HeaderCell>
            <Table.HeaderCell>Upload date</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.HeaderRow>
        }
      >
        {documents.map((doc) => (
          <Table.Row key={doc.id}>
            <Table.Cell>
              <div className="flex items-center gap-2">
                <IconWithBackground icon="FeatherFileText" />
                <span className="whitespace-nowrap font-body-bold text-body-bold text-neutral-700">{doc.fileName}</span>
              </div>
            </Table.Cell>
            <Table.Cell>
              <Badge variant="neutral">{formatDocumentType(doc.documentType)}</Badge>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-2">
                <Avatar size="small" image={doc.userProfile?.avatarUrl || ""}>
                  {doc.userProfile?.firstName?.[0] || "U"}
                  {doc.userProfile?.lastName?.[0] || ""}
                </Avatar>
                <span className="whitespace-nowrap font-body-bold text-body-bold text-default-font">
                  {doc.userProfile?.firstName} {doc.userProfile?.lastName}
                </span>
              </div>
            </Table.Cell>
            <Table.Cell>
              <span className="whitespace-nowrap font-body text-body text-neutral-500">
                {format(new Date(doc.uploadedAt), "PPP")}
              </span>
            </Table.Cell>
            <Table.Cell>
              <div className="flex shrink-0 grow basis-0 items-center justify-end gap-2">
                <IconButton icon="FeatherEye" onClick={() => handleView(doc.id)} />
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </div>
  );
};
