import { useDocuments } from "@/hooks/useDocuments";
import { useEffect, useState } from "react";

export const VerificationPhoto = ({ document, index }) => {
  const { downloadDocument } = useDocuments();
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getDownloadUrl = async () => {
      setIsLoading(true);
      try {
        const url = await downloadDocument(document.id);
        if (url) setImageUrl(url);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getDownloadUrl();
  }, [document.id, downloadDocument]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg">
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      ) : imageUrl ? (
        <img src={imageUrl} alt={`Verification photo ${index + 1}`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">Image unavailable</span>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => imageUrl && window.open(imageUrl, "_blank")}
          className="rounded-full bg-white p-2 text-gray-800 shadow hover:bg-gray-100"
          disabled={!imageUrl || isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6"></path>
            <path d="M10 14 21 3"></path>
            <path d="M18 13v8H3V6h8"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
