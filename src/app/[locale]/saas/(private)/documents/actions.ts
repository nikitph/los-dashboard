"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/prisma";
import {
  deleteFile,
  determineStorageType,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
} from "@/lib/backblaze/backblazeUtils";

// Response type for actions
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

// Schema for document metadata
const documentMetadataSchema = z.object({
  loanApplicationId: z.string().uuid().optional(),
  applicantId: z.string().uuid().optional(),
  verificationId: z.string().uuid().optional(),
  coApplicantId: z.string().uuid().optional(),
  guarantorId: z.string().uuid().optional(),
  incomeId: z.string().uuid().optional(),
  incomeDetailId: z.string().uuid().optional(),
  dependentId: z.string().uuid().optional(),
  loanObligationId: z.string().uuid().optional(),
  loanObligationDetailId: z.string().uuid().optional(),
  bankId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  bankConfigurationId: z.string().uuid().optional(),
  documentType: z.enum([
    "AADHAAR_CARD",
    "PAN_CARD",
    "IDENTITY_PROOF",
    "ADDRESS_PROOF",
    "INCOME_PROOF",
    "BANK_STATEMENT",
    "PROPERTY_DOCUMENT",
    "VEHICLE_DOCUMENT",
    "LOAN_AGREEMENT",
    "VERIFICATION_PHOTO",
    "KYC_DOCUMENT",
    "APPLICATION_FORM",
    "APPLICANT_PHOTO",
    "OTHER",
  ]),
  mimeType: z.string(),
  fileName: z.string(),
  fileSize: z.number().default(0),
  metadata: z.record(z.any()).optional(),
  uploadedById: z.string(),
});

// Type for document metadata
export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;

/**
 * Generate a presigned URL for direct file upload to Backblaze
 */
export async function getDocumentUploadUrl(metadata: DocumentMetadata): Promise<ActionResponse> {
  try {
    // Validate metadata
    const validatedData = documentMetadataSchema.parse(metadata);

    console.log("metadata", metadata);

    // Determine storage type based on document type
    const storageType = determineStorageType(validatedData.mimeType, validatedData.documentType as any);

    // Determine entity type based on provided IDs
    let entityType = "document";
    let entityId = "general";

    if (validatedData.loanApplicationId) {
      entityType = "loan";
      entityId = validatedData.loanApplicationId;
    } else if (validatedData.applicantId) {
      entityType = "applicant";
      entityId = validatedData.applicantId;
    } else if (validatedData.verificationId) {
      entityType = "verification";
      entityId = validatedData.verificationId;
    } else if (validatedData.coApplicantId) {
      entityType = "coApplicant";
      entityId = validatedData.coApplicantId;
    } else if (validatedData.guarantorId) {
      entityType = "guarantor";
      entityId = validatedData.guarantorId;
    } else if (validatedData.incomeId) {
      entityType = "income";
      entityId = validatedData.incomeId;
    } else if (validatedData.incomeDetailId) {
      entityType = "incomeDetail";
      entityId = validatedData.incomeDetailId;
    } else if (validatedData.dependentId) {
      entityType = "dependent";
      entityId = validatedData.dependentId;
    } else if (validatedData.loanObligationId) {
      entityType = "loanObligation";
      entityId = validatedData.loanObligationId;
    } else if (validatedData.loanObligationDetailId) {
      entityType = "loanObligationDetail";
      entityId = validatedData.loanObligationDetailId;
    } else if (validatedData.bankId) {
      entityType = "bank";
      entityId = validatedData.bankId;
    } else if (validatedData.subscriptionId) {
      entityType = "subscription";
      entityId = validatedData.subscriptionId;
    } else if (validatedData.bankConfigurationId) {
      entityType = "bankConfiguration";
      entityId = validatedData.bankConfigurationId;
    }

    // Generate presigned URL for upload
    const { uploadUrl, fileKey } = await getPresignedUploadUrl(
      validatedData.mimeType,
      entityType as any,
      entityId,
      validatedData.fileName,
    );

    // Generate a base URL for the file (without presigned params)
    const fileUrl = `${process.env.NEXT_PUBLIC_BACKBLAZE_PUBLIC_URL}/${fileKey}`;

    // Pre-create document record in database
    const document = await prisma.document.create({
      data: {
        fileName: validatedData.fileName,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        fileUrl: fileUrl,
        storageType: storageType,
        documentType: validatedData.documentType,
        status: "PENDING",
        metadata: validatedData.metadata || {
          fileKey: fileKey,
        },
        uploadedById: validatedData.uploadedById,
        uploadedAt: new Date(),
        // Set the relationships based on provided IDs
        loanApplicationId: validatedData.loanApplicationId,
        applicantId: validatedData.applicantId,
        verificationId: validatedData.verificationId,
        coApplicantId: validatedData.coApplicantId,
        guarantorId: validatedData.guarantorId,
        incomeId: validatedData.incomeId,
        incomeDetailId: validatedData.incomeDetailId,
        dependentId: validatedData.dependentId,
        loanObligationId: validatedData.loanObligationId,
        loanObligationDetailId: validatedData.loanObligationDetailId,
        bankId: validatedData.bankId,
        subscriptionId: validatedData.subscriptionId,
        bankConfigurationId: validatedData.bankConfigurationId,
      },
    });

    return {
      success: true,
      message: "Upload URL generated successfully",
      data: {
        uploadUrl,
        fileKey,
        documentId: document.id,
        expiresIn: 3600, // URL expires in 1 hour
      },
    };
  } catch (error) {
    console.error("Error generating upload URL:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to generate upload URL",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update document status after client-side upload completes
 */
export async function confirmDocumentUpload(documentId: string, size: number): Promise<ActionResponse> {
  try {
    // Get the current document to access its metadata
    const currentDoc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { metadata: true, loanApplicationId: true },
    });

    if (!currentDoc) {
      return {
        success: false,
        message: "Document not found",
      };
    }

    // Update metadata with file size
    const updatedMetadata = {
      ...(currentDoc.metadata as any),
      uploadCompleted: true,
    };

    // Update document record with final size
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        fileSize: size,
        metadata: updatedMetadata,
        status: "PENDING", // Keep as pending for verification
      },
    });

    // Revalidate relevant paths
    if (document.loanApplicationId) {
      revalidatePath(`/saas/loan-applications/${document.loanApplicationId}`);
    }

    return {
      success: true,
      message: "Document upload confirmed",
      data: document,
    };
  } catch (error) {
    console.error("Error confirming document upload:", error);
    return {
      success: false,
      message: "Failed to confirm document upload",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a download URL for a document
 */
export async function getDocumentDownloadUrl(documentId: string): Promise<ActionResponse> {
  try {
    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId, deletedAt: null },
    });

    if (!document) {
      return {
        success: false,
        message: "Document not found",
      };
    }

    // Extract fileKey from metadata
    const metadata = document.metadata as any;
    if (!metadata?.fileKey) {
      return {
        success: false,
        message: "Document metadata is missing file key",
      };
    }

    // Generate download URL
    const downloadUrl = await getPresignedDownloadUrl(metadata.fileKey);

    return {
      success: true,
      message: "Download URL generated successfully",
      data: {
        downloadUrl,
        fileName: document.fileName,
        mimeType: document.mimeType,
        expiresIn: 3600, // URL expires in 1 hour
      },
    };
  } catch (error) {
    console.error("Error generating download URL:", error);
    return {
      success: false,
      message: "Failed to generate download URL",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a document (soft delete)
 */
export async function deleteDocument(documentId: string): Promise<ActionResponse> {
  try {
    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId, deletedAt: null },
    });

    if (!document) {
      return {
        success: false,
        message: "Document not found",
      };
    }

    // Extract fileKey from metadata
    const metadata = document.metadata as any;
    if (metadata?.fileKey) {
      // Delete from storage if we have the key
      try {
        await deleteFile(metadata.fileKey);
      } catch (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue with soft delete even if storage delete fails
      }
    }

    // Update document record (soft delete)
    await prisma.document.update({
      where: { id: documentId },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidate relevant paths if loan application exists
    if (document.loanApplicationId) {
      revalidatePath(`/saas/loan-applications/${document.loanApplicationId}`);
    }

    return {
      success: true,
      message: "Document deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting document:", error);
    return {
      success: false,
      message: "Failed to delete document",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all documents for a loan application
 */
export async function getLoanApplicationDocuments(loanApplicationId: string): Promise<ActionResponse> {
  try {
    const documents = await prisma.document.findMany({
      where: {
        loanApplicationId,
        deletedAt: null,
      },
      orderBy: { uploadedAt: "desc" },
    });

    return {
      success: true,
      message: "Documents fetched successfully",
      data: documents,
    };
  } catch (error) {
    console.error("Error fetching loan application documents:", error);
    return {
      success: false,
      message: "Failed to fetch documents",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update document verification status
 */
export async function updateDocumentVerificationStatus(
  documentId: string,
  status: "PENDING" | "COMPLETED" | "FAILED",
  verificationNotes?: string,
): Promise<ActionResponse> {
  try {
    // Get the current document to access its metadata
    const currentDoc = await prisma.document.findUnique({
      where: { id: documentId, deletedAt: null },
      select: { metadata: true, loanApplicationId: true },
    });

    if (!currentDoc) {
      return {
        success: false,
        message: "Document not found",
      };
    }

    // Update metadata with verification notes if provided
    const updatedMetadata = {
      ...(currentDoc.metadata as any),
      verificationNotes: verificationNotes || (currentDoc.metadata as any)?.verificationNotes,
      verifiedAt: status === "COMPLETED" ? new Date().toISOString() : (currentDoc.metadata as any)?.verifiedAt,
      rejectedAt: status === "FAILED" ? new Date().toISOString() : (currentDoc.metadata as any)?.rejectedAt,
    };

    // Update document record
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: status,
        metadata: updatedMetadata,
      },
    });

    // Revalidate relevant paths
    if (document.loanApplicationId) {
      revalidatePath(`/saas/loan-applications/${document.loanApplicationId}`);
    }

    return {
      success: true,
      message: `Document status updated to ${status}`,
      data: document,
    };
  } catch (error) {
    console.error("Error updating document verification status:", error);
    return {
      success: false,
      message: "Failed to update document status",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get documents by entity ID and type
 */
export async function getDocumentsByEntity(entityType: string, entityId: string): Promise<ActionResponse> {
  try {
    // Create a where condition based on entity type
    const whereCondition: any = {
      deletedAt: null,
    };

    switch (entityType) {
      case "loanApplication":
        whereCondition.loanApplicationId = entityId;
        break;
      case "applicant":
        whereCondition.applicantId = entityId;
        break;
      case "verification":
        whereCondition.verificationId = entityId;
        break;
      case "coApplicant":
        whereCondition.coApplicantId = entityId;
        break;
      case "guarantor":
        whereCondition.guarantorId = entityId;
        break;
      case "income":
        whereCondition.incomeId = entityId;
        break;
      case "incomeDetail":
        whereCondition.incomeDetailId = entityId;
        break;
      case "dependent":
        whereCondition.dependentId = entityId;
        break;
      case "loanObligation":
        whereCondition.loanObligationId = entityId;
        break;
      case "loanObligationDetail":
        whereCondition.loanObligationDetailId = entityId;
        break;
      case "bank":
        whereCondition.bankId = entityId;
        break;
      case "subscription":
        whereCondition.subscriptionId = entityId;
        break;
      case "bankConfiguration":
        whereCondition.bankConfigurationId = entityId;
        break;
      default:
        return {
          success: false,
          message: "Invalid entity type",
        };
    }

    const documents = await prisma.document.findMany({
      where: whereCondition,
      orderBy: { uploadedAt: "desc" },
    });

    return {
      success: true,
      message: "Documents fetched successfully",
      data: documents,
    };
  } catch (error) {
    console.error(`Error fetching documents for ${entityType}:`, error);
    return {
      success: false,
      message: "Failed to fetch documents",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
