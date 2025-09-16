"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart, Play, Share2 } from "lucide-react";
import { ProductImage } from "@/lib/types/product";

interface ProductImageGalleryProps {
  productName?: string;
  assets?: ProductImage[];
  tag?: string;
}

// Static data untuk testing
const staticAssets: ProductImage[] = [
  {
    id: "1",
    type: "image",
    url: "https://down-id.img.susercontent.com/file/sg-11134201-7rdxd-m0e23s2x3gz40b@resize_w900_nl.webp",
    alt: "Dog toy 1",
  },
  {
    id: "2",
    type: "video",
    url: "https://down-id.img.susercontent.com/file/sg-11134201-7rdvx-m0e23skyeh5xaa.webp",
    alt: "Product demo video",
  },
  {
    id: "3",
    type: "image",
    url: "https://down-id.img.susercontent.com/file/sg-11134201-7rdvx-m0e23skyeh5xaa.webp",
    alt: "Dog toy 2",
  },
];

export function ProductGallery({
  productName = "Magician BIP Set",
  assets = staticAssets,
  tag = "Best Seller",
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isVideoMode = assets[currentIndex]?.type === "video";

  const selectMedia = (index: number) => {
    setCurrentIndex(index);
  };

  if (!assets.length) return null;

  const currentAsset = assets[currentIndex];

  return (
    <div className="space-y-4">
      {/* Main Image/Video Display */}
      <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden group">
        {/* Tag Labels */}
        <div className="absolute top-6 left-6 flex gap-2 z-10">
          <span className="px-3 py-1 text-xs font-bold rounded-md bg-[#1F4E46] text-white">
            {tag}
          </span>
        </div>

        {/* Favorite and Share Button */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-2 rounded-full transition-colors ${
              isWishlisted
                ? "bg-red-100 text-red-600"
                : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
            />
          </button>
          <button className="p-2 bg-white/80 text-gray-600 rounded-full hover:bg-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Asset: Video / Image */}
        {isVideoMode ? (
          <video
            src={currentAsset.url}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full cursor-zoom-in"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
              e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty("--mouse-x", "50%");
              e.currentTarget.style.setProperty("--mouse-y", "50%");
            }}
          >
            <img
              src={currentAsset.url || "/placeholder.svg"}
              alt={
                currentAsset.alt || `${productName} - Image ${currentIndex + 1}`
              }
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-150"
              style={{
                transformOrigin: "var(--mouse-x, 50%) var(--mouse-y, 50%)",
              }}
            />
          </div>
        )}

        {/* Slide Indicators */}
        {assets.length > 1 && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {assets.map((_, index) => (
              <button
                key={index}
                onClick={() => selectMedia(index)}
                className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}

        {/* Media Type Badge */}
        {isVideoMode && (
          <Badge className="absolute bottom-4 left-4 bg-black/70 text-white">
            <Play className="h-3 w-3 mr-1" />
            Video
          </Badge>
        )}
      </div>

      {/* Thumbnail Grid */}
      {assets.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {assets.map((asset, index) => (
            <button
              key={asset.id}
              onClick={() => selectMedia(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground"
              }`}
            >
              <img
                src={asset.url || "/placeholder.svg"}
                alt={asset.alt || `${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {asset.type === "video" && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
