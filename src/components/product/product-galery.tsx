"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Heart, Play, X } from "lucide-react";
import { ProductData, ProductImage } from "@/lib/types/product";
import ShareButton from "./share-button";
import { TagData } from "@/lib/types/tag";
import { hasTag, isNewArrival } from "@/lib/helpers/product";

interface ProductGalleryProps {
  product: ProductData;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showFullScreen, setShowFullscreen] = useState(false);

  const isVideoMode = product.productMedia[currentIndex]?.type === "video";

  const selectMedia = (index: number) => {
    setCurrentIndex(index);
  };

  if (!product.productMedia.length) return null;

  const currentAsset = product.productMedia[currentIndex];

  return (
    <div className="space-y-4">
      {/* Main Image/Video Display */}
      <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden group">
        {/* Tag Labels */}
        <div className="absolute top-4 left-4 shadow-4xl flex gap-2 z-10">
          {
            isNewArrival(product.createdAt) ? (
              <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                New Arrivals
              </span>
            ) : hasTag(product.tags, "best sellers") ? (
              <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Best Sellers
              </span>
            ) : (
              <p>diskon</p>
            )
            // product.originalPrice && discount > 0 ? (
            //   <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            //     -{discount}%
            //   </span>
            // ) : null
          }
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
          <ShareButton url={`http://localhost:3000/product/${product.slug}`} />
        </div>

        {/* Asset: Video / Image */}
        <div
          className="w-full h-full cursor-pointer"
          onClick={() => setShowFullscreen(true)}
        >
          {isVideoMode ? (
            <video
              src={currentAsset.imageUrl}
              poster={currentAsset.imageUrl}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              {/* Fallback jika browser tidak mendukung */}
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={currentAsset.imageUrl || "/placeholder.svg"}
              alt={`${product.productName} - Image ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          )}

          {/* Navigation Buttons */}
          {product.productMedia.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIndex =
                    currentIndex === 0
                      ? product.productMedia.length - 1
                      : currentIndex - 1;
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
                    currentIndex === product.productMedia.length - 1
                      ? 0
                      : currentIndex + 1;
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
            {product.productMedia.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIndex =
                    currentIndex === 0
                      ? product.productMedia.length - 1
                      : currentIndex - 1;
                  setCurrentIndex(prevIndex);
                }}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Next Button */}
            {product.productMedia.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIndex =
                    currentIndex === product.productMedia.length - 1
                      ? 0
                      : currentIndex + 1;
                  setCurrentIndex(nextIndex);
                }}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <div className="max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center">
              <img
                src={currentAsset.imageUrl || "/placeholder.svg"}
                alt={`${product.productName} - Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={() => setShowFullscreen(false)}
              />
            </div>
          </div>
        )}

        {/* Slide Indicators */}
        {product.productMedia.length > 1 && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {product.productMedia.map((_, index) => (
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
      </div>

      {/* Thumbnail Grid */}
      {product.productMedia.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {product.productMedia.map((asset, index) => (
            <button
              key={index}
              onClick={() => selectMedia(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground"
              }`}
            >
              {asset.type === "image" ? (
                <img
                  src={asset.imageUrl || "/placeholder.svg"}
                  alt={`${product.productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <video
                    src={asset.imageUrl}
                    poster={asset.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
