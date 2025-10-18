"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Heart, Play, X } from "lucide-react";
import { ProductImage } from "@/lib/types/product";
import ShareButton from "./share-button";

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
  const [showFullScreen, setShowFullscreen] = useState(false);

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
        <div className="absolute top-4 left-4 shadow-4xl flex gap-2 z-10">
          <span className="px-3 py-2 text-xs font-semibold rounded-full  bg-[#1F4E46] text-white">
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
          <ShareButton url="http://localhost:3000/product/magician-bip-set" />
        </div>

        {/* Asset: Video / Image */}
        <div
          className="w-full h-full cursor-pointer"
          onClick={() => setShowFullscreen(true)}
        >
          {isVideoMode ? (
            <video
              src={currentAsset.url}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentAsset.url || "/placeholder.svg"}
              alt={
                currentAsset.alt || `${productName} - Image ${currentIndex + 1}`
              }
              className="w-full h-full object-cover"
            />
          )}

          {/* Navigation Buttons */}
          {assets.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIndex =
                    currentIndex === 0 ? assets.length - 1 : currentIndex - 1;
                  setCurrentIndex(prevIndex);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-gray-600 rounded-full transition-all z-10 sm:p-2 opacity-0 group-hover:opacity-100 touch:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIndex =
                    currentIndex === assets.length - 1 ? 0 : currentIndex + 1;
                  setCurrentIndex(nextIndex);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-gray-600 rounded-full transition-all z-10 sm:p-2 opacity-0 group-hover:opacity-100 touch:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}
        </div>

        {/* Fullscreen Modal */}
        {showFullScreen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Previous Button */}
            {assets.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIndex =
                    currentIndex === 0 ? assets.length - 1 : currentIndex - 1;
                  setCurrentIndex(prevIndex);
                }}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Next Button */}
            {assets.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIndex =
                    currentIndex === assets.length - 1 ? 0 : currentIndex + 1;
                  setCurrentIndex(nextIndex);
                }}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <div className="max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center">
              <img
                src={currentAsset.url || "/placeholder.svg"}
                alt={
                  currentAsset.alt ||
                  `${productName} - Image ${currentIndex + 1}`
                }
                className="max-w-full max-h-full object-contain"
                onClick={() => setShowFullscreen(false)}
              />
            </div>
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
