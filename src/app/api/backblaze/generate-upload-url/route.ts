import { NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/utils/backblaze/backblazeUtils";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { fileName, contentType, fileSize, entityType, entityId } = body;

    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    console.log("contentType", contentType);

    // Generate the presigned URL for upload
    const { uploadUrl, fileKey } = await getPresignedUploadUrl(contentType, entityType, entityId, fileName);

    // Return the upload URL and key
    return NextResponse.json({
      uploadUrl,
      fileKey,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);

    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
