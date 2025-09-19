"use client";
import React, { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Product } from "@/lib/types/product";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { currency, format } = useCurrency();

  const router = useRouter();

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 1500);
  };

  const discount =
    product.originalPrice && product.originalPrice[currency]
      ? Math.round(
          ((product.originalPrice[currency] - product.price[currency]) /
            product.originalPrice[currency]) *
            100
        )
      : 0;

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {product.tag === "New Arrivals" && (
          <span className="bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            New Arrivals
          </span>
        )}
        {product.tag === "Best Sellers" && (
          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Best Sellers
          </span>
        )}
        {product.originalPrice && discount > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Main Image */}
      <div
        onClick={() => router.push(`/product/magician-bip-set`)}
        className="relative h-55 overflow-hidden cursor-pointer"
        onMouseEnter={() => {
          if (product.images.length > 1) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <div className="relative w-full h-full">
          {product.images.map((image, index) => (
            <img
              key={image.id}
              src={image.url}
              alt={image.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? "bg-white scale-125"
                    : "bg-white/60 hover:bg-white/80"
                } cursor-pointer`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Name + Wishlist */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200 flex-1 pr-2">
            {product.name}
          </h3>
          <Heart
            onClick={() => setIsLiked(!isLiked)}
            className={`w-5 h-5 transition-colors duration-200 flex-shrink-0 ${
              isLiked
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            } cursor-pointer`}
          />
        </div>

        {/* Bottom: Price + Button */}
        <div className="mt-auto">
          <div className="mb-3">
            {product.originalPrice && (
              <p className="text-base text-gray-400 line-through">
                {format(product.originalPrice[currency])}
              </p>
            )}
            <p className="text-lg font-bold text-gray-900">
              {format(product.price[currency])}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full py-1 bg-primary/85 text-white border-primary rounded-lg font-semibold transition-all duration-200 hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
