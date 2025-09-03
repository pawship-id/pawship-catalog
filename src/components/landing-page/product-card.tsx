"use client";
import React, { useState } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "../ui/button";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
  tag: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 1500);
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
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

      {/* Main Image Container */}
      <div
        className="relative h-55 overflow-hidden cursor-pointer"
        onMouseEnter={() => {
          if (product.images.length > 1) {
            setCurrentImageIndex(1);
          }
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

        {/* Image Thumbnails - Visible on Hover */}
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
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
            {product.name}
          </h3>
          {/* Wishlist Button */}
          <Heart
            onClick={() => setIsLiked(!isLiked)}
            className={`w-5 h-5 transition-colors duration-200 ${
              isLiked
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-gray-900">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-base text-gray-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="outline"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full py-1 bg-primary/85 text-white border-primary rounded-lg font-semibold transition-all duration-200 hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
