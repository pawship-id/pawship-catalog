"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import ShareButton from "./share-button";
import { TagData } from "@/lib/types/tag";
import { VariantRow } from "@/lib/types/product";
import { hasTag, isNewArrival } from "@/lib/helpers/product";

interface MediaAsset {
  imageUrl: string;
  imagePublicId?: string;
  type: string;
}

interface ProductGalleryProps {
  productMedia: MediaAsset[];
  product: {
    productName: string;
    slug: string;
    tags: TagData[];
    createdAt: string | Date;
  };
  selectedVariant?: {
    selectedVariantDetail: VariantRow;
  };
}

export function ProductGallery({
  productMedia,
  product,
  selectedVariant,
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const variantImageUrl: string | undefined =
    typeof selectedVariant?.selectedVariantDetail?.image === "string"
      ? selectedVariant.selectedVariantDetail.image
      : selectedVariant?.selectedVariantDetail?.image?.imageUrl;

  // Sync selected variant image
  useEffect(() => {
    if (!variantImageUrl) {
      setCurrentIndex(0);
      return;
    }

    const index = productMedia.findIndex(
      (item) => item.imageUrl === variantImageUrl
    );

    setCurrentIndex(index !== -1 ? index : 0);
  }, [variantImageUrl, productMedia]);

  if (!productMedia || productMedia.length === 0) return null;

  const currentAsset = productMedia[currentIndex];
  const isVideo = currentAsset.type === "video";

  const prev = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? productMedia.length - 1 : prev - 1
    );

  const next = () =>
    setCurrentIndex((prev) =>
      prev === productMedia.length - 1 ? 0 : prev + 1
    );

  return (
    <div className="space-y-4">
      {/* Main Image/Video */}
      <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden group">
        {/* Tag Label */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {isNewArrival(product.createdAt) ? (
            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
              New Arrival
            </span>
          ) : hasTag(product.tags, "best sellers") ? (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Best Seller
            </span>
          ) : (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Discount
            </span>
          )}
        </div>

        {/* Wishlist & Share */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setIsWishlisted((s) => !s)}
            className={`p-2 rounded-full transition ${
              isWishlisted ? "bg-red-100 text-red-600" : "bg-white/80"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? "fill-current" : "text-gray-600"
              }`}
            />
          </button>

          <ShareButton
            url={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/product/${product.slug}`}
          />
        </div>

        {/* Asset View Clickable */}
        <div
          onClick={() => setIsViewerOpen(true)}
          className="w-full h-full cursor-pointer"
        >
          {isVideo ? (
            <video
              src={currentAsset.imageUrl}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentAsset.imageUrl}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Nav Controls */}
        {productMedia.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full opacity-0 group-hover:opacity-100"
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {productMedia.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {productMedia.map((m, idx) => (
            <button
              key={m.imageUrl}
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                idx === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground"
              }`}
            >
              {m.type === "video" ? (
                <video
                  src={m.imageUrl}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img src={m.imageUrl} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ✅ Modal Image Viewer */}
      {isViewerOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsViewerOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous Button */}
          {productMedia.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next Button */}
          {productMedia.length > 1 && (
            <button
              onClick={next}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div className="max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center">
            {isVideo ? (
              <video
                src={currentAsset.imageUrl}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="max-w-full max-h-[90vh] rounded-lg"
              />
            ) : (
              <img
                src={currentAsset.imageUrl}
                alt={product.productName}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
