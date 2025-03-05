"use client";

import { useRef, useState } from "react";
import { validateFile } from "@/utils/backblaze/backblazeUtils";

interface SimpleBackblazeUploaderProps {
  onUploadComplete?: (fileInfo: { fileName: string; fileUrl: string; fileSize: number }) => void;
}

export default function SimpleBackblazeUploader({ onUploadComplete }: SimpleBackblazeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setUploadResult(null);

    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const selectedFile = event.target.files[0];
    const validation = validateFile(selectedFile);

    if (!validation.valid) {
      setError(validation.message || "Invalid file");
      return;
    }

    setFile(selectedFile);
  };

  // Clear file selection
  const handleClearFile = () => {
    setFile(null);
    setProgress(0);
    setError(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Generate presigned URL from server
  const getUploadUrl = async () => {
    if (!file) return null;

    try {
      const response = await fetch("/api/backblaze/generate-upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get upload URL: ${errorText}`);
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get upload URL";
      setError(message);
      return null;
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setUploadResult(null);

    try {
      // Step 1: Get a presigned URL from our server
      const urlData = await getUploadUrl();
      if (!urlData || !urlData.uploadUrl) {
        throw new Error("Failed to get upload URL");
      }

      // Step 2: Upload directly to Backblaze using the presigned URL
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Use a promise to handle the XHR response
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.open("PUT", urlData.uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error occurred during upload"));
        };

        xhr.send(file);
      });

      // Wait for the upload to complete
      await uploadPromise;

      // Step 3: Confirm the upload with our server
      const confirmResponse = await fetch("/api/backblaze/confirm-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileKey: urlData.fileKey,
          fileSize: file.size,
        }),
      });

      if (!confirmResponse.ok) {
        const errorText = await confirmResponse.text();
        throw new Error(`Failed to confirm upload: ${errorText}`);
      }

      const confirmation = await confirmResponse.json();

      // Success - update the UI and call callback if provided
      setUploadResult(`File uploaded successfully! URL: ${confirmation.fileUrl}`);
      if (onUploadComplete) {
        onUploadComplete({
          fileName: file.name,
          fileUrl: confirmation.fileUrl,
          fileSize: file.size,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
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

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Simple Backblaze Uploader</h2>

      {/* File Input */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">Select a file</label>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Selected File Preview */}
      {file && (
        <div className="mb-4 rounded-md bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <button onClick={handleClearFile} disabled={uploading} className="text-sm text-red-500 hover:text-red-700">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Success Message */}
      {uploadResult && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {uploadResult}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full rounded-md px-4 py-2 font-medium text-white ${
          !file || uploading ? "cursor-not-allowed bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploading ? "Uploading..." : "Upload to Backblaze"}
      </button>
    </div>
  );
}
