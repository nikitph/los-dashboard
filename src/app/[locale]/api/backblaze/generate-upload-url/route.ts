import { NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/backblaze/backblazeUtils";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { fileName, contentType, fileSize } = body;

    // Validate the required parameters
    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Generate a random entity ID for testing (in a real app, this would be a real entity ID)
    const testEntityId = crypto.randomUUID();

    // Generate the presigned URL for upload
    const { uploadUrl, fileKey } = await getPresignedUploadUrl(
      contentType,
      "test", // Entity type - just for testing
      testEntityId,
      fileName,
    );

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
