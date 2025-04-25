import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// Environment variables for Backblaze B2
const BACKBLAZE_ENDPOINT = process.env.NEXT_PUBLIC_BACKBLAZE_ENDPOINT || "";
const BACKBLAZE_BUCKET_NAME = process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME || "";
const BACKBLAZE_KEY_ID = process.env.NEXT_PUBLIC_BACKBLAZE_KEY_ID || "";
const BACKBLAZE_APP_KEY = process.env.NEXT_PUBLIC_BACKBLAZE_APP_KEY || "";

// Validate required environment variables
if (!BACKBLAZE_ENDPOINT || !BACKBLAZE_BUCKET_NAME || !BACKBLAZE_KEY_ID || !BACKBLAZE_APP_KEY) {
  console.error("Missing required Backblaze environment variables");
}

// Configure S3 client for Backblaze B2
const s3Client = new S3Client({
  endpoint: BACKBLAZE_ENDPOINT,
  region: "eu-central-003",
  credentials: {
    accessKeyId: BACKBLAZE_KEY_ID,
    secretAccessKey: BACKBLAZE_APP_KEY,
  },
});

// Define accepted file types
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_DOCUMENT_TYPES = ["application/pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Generates a unique file key for Backblaze storage
 */
const generateFileKey = (
  fileType: string,
  entityType:
    | "loan"
    | "customer"
    | "verification"
    | "income"
    | "document"
    | "applicant"
    | "coApplicant"
    | "guarantor"
    | "incomeDetail"
    | "dependent"
    | "loanObligation"
    | "loanObligationDetail"
    | "bank"
    | "subscription"
    | "bankConfiguration",
  entityId: string,
): string => {
  const extension = fileType === "application/pdf" ? "pdf" : fileType.split("/")[1];
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const uuid = uuidv4().slice(0, 8);

  return `${entityType}/${entityId}/${timestamp}-${uuid}.${extension}`;
};

/**
 * Validates file type and size
 */
export const validateFile = (file: File, allowPdf = true): { valid: boolean; message?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      message: `File size exceeds maximum limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
    };
  }

  // Validate file type
  const acceptedTypes = [...ACCEPTED_IMAGE_TYPES];
  if (allowPdf) acceptedTypes.push(...ACCEPTED_DOCUMENT_TYPES);

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `File type not supported. Please upload ${allowPdf ? "a PDF, JPG, PNG, or WebP file" : "a JPG, PNG, or WebP image"}`,
    };
  }

  return { valid: true };
};

/**
 * Generates a presigned URL for direct browser-to-B2 uploads
 */
export const getPresignedUploadUrl = async (
  fileType: string,
  entityType:
    | "loan"
    | "customer"
    | "verification"
    | "income"
    | "document"
    | "applicant"
    | "coApplicant"
    | "guarantor"
    | "incomeDetail"
    | "dependent"
    | "loanObligation"
    | "loanObligationDetail"
    | "bank"
    | "subscription"
    | "bankConfiguration",
  entityId: string,
  fileName?: string,
  expiresIn = 3600, // URL expiration time in seconds (1 hour)
): Promise<{ uploadUrl: string; fileKey: string }> => {
  const fileKey = fileName ? `${entityType}/${entityId}/${fileName}` : generateFileKey(fileType, entityType, entityId);

  console.log("filekey", fileKey);

  const command = new PutObjectCommand({
    Bucket: BACKBLAZE_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    console.log("Generated upload URL:", uploadUrl);
    return { uploadUrl, fileKey };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate upload URL");
  }
};

/**
 * Uploads a file directly to Backblaze B2
 * Note: For server-side uploads only. For client-side, use presigned URLs.
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  fileType: string,
  entityType:
    | "loan"
    | "customer"
    | "verification"
    | "income"
    | "document"
    | "applicant"
    | "coApplicant"
    | "guarantor"
    | "incomeDetail"
    | "dependent"
    | "loanObligation"
    | "loanObligationDetail"
    | "bank"
    | "subscription"
    | "bankConfiguration",
  entityId: string,
  fileName?: string,
): Promise<{ fileKey: string; eTag: string }> => {
  const fileKey = fileName ? `${entityType}/${entityId}/${fileName}` : generateFileKey(fileType, entityType, entityId);

  const command = new PutObjectCommand({
    Bucket: BACKBLAZE_BUCKET_NAME,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: fileType,
  });

  try {
    const response = await s3Client.send(command);
    return {
      fileKey,
      eTag: response.ETag || "",
    };
  } catch (error) {
    console.error("Error uploading file to Backblaze:", error);
    throw new Error("Failed to upload file");
  }
};

/**
 * Generates a presigned URL for downloading/viewing a file
 */
export const getPresignedDownloadUrl = async (
  fileKey: string,
  expiresIn = 3600, // URL expiration time in seconds (1 hour)
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: BACKBLAZE_BUCKET_NAME,
    Key: fileKey,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw new Error("Failed to generate download URL");
  }
};

/**
 * Deletes a file from Backblaze B2
 */
export const deleteFile = async (fileKey: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: BACKBLAZE_BUCKET_NAME,
    Key: fileKey,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from Backblaze:", error);
    throw new Error("Failed to delete file");
  }
};

/**
 * Maps file type to storage type (hot or cold)
 * Determines storage class based on document type
 */
export const determineStorageType = (
  fileType: string,
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
    | "OTHER" = "OTHER",
): "hot" | "cold" => {
  // Critical documents that need to be stored long-term go to cold storage
  const coldStorageDocuments = ["AADHAAR_CARD", "PAN_CARD", "IDENTITY_PROOF", "LOAN_AGREEMENT", "PROPERTY_DOCUMENT"];

  if (coldStorageDocuments.includes(documentType)) {
    return "cold";
  }

  // Verification photos and temporary documents stay in hot storage
  if (documentType === "VERIFICATION_PHOTO" || fileType.startsWith("image/")) {
    return "hot";
  }

  // Default to hot storage for other document types
  return "hot";
};
