"use client";

import { useEffect, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
}

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: { imageUrl: string; imagePublicId: string }) => void;
  onUploadNew: (file: File) => Promise<void>;
}

export default function ImageGalleryModal({
  isOpen,
  onClose,
  onSelectImage,
  onUploadNew,
}: ImageGalleryModalProps) {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    } else {
      setSelectedFile(null);
    }
  }, [isOpen]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching images from Cloudinary...");
      const response = await fetch("/api/cloudinary-images?folder=products");
      const result = await response.json();

      console.log("API Response:", result);

      if (result.success) {
        setImages(result.data || []);
        console.log(`Loaded ${result.data?.length || 0} images`);
      } else {
        setError(result.message || "Failed to load images");
        console.error("API Error:", result);
      }
    } catch (error: any) {
      console.error("Error fetching images:", error);
      setError(error.message || "Network error while fetching images");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await onUploadNew(selectedFile);
      setSelectedFile(null);
      // Close modal immediately after successful upload
      onClose();
    } catch (error) {
      console.error("Error uploading:", error);
      // Only refresh if upload failed and modal stays open
      await fetchImages();
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Select Product Image</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-2 items-center">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="min-w-[100px]"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New
                </>
              )}
            </Button>
          </div>
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Gallery */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <p className="font-semibold mb-2">Error loading images</p>
              <p className="text-sm text-gray-600">{error}</p>
              <Button
                type="button"
                onClick={fetchImages}
                className="mt-4"
                size="sm"
              >
                Retry
              </Button>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p>No images found</p>
              <p className="text-sm">Upload a new image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {images.map((image) => (
                <button
                  key={image.publicId}
                  type="button"
                  onClick={() => {
                    onSelectImage({
                      imageUrl: image.secureUrl,
                      imagePublicId: image.publicId,
                    });
                    onClose();
                  }}
                  className="relative aspect-square rounded-lg border-2 border-gray-200 hover:border-primary overflow-hidden group transition-all"
                >
                  <img
                    src={image.secureUrl}
                    alt={image.publicId}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            {images.length} image(s) available
          </p>
        </div>
      </div>
    </div>
  );
}
