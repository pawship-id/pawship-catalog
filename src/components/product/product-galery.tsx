import React, { useState } from "react";
import { Heart, Share2, ZoomIn } from "lucide-react";
import { Product } from "@/app/product/[slug]/page";

interface ProductGalleryProps {
  product: Product;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getProductLabels = () => {
    const labels = [];

    if (product.isNewArrival) {
      labels.push({ text: "New Arrival", color: "bg-emerald-500" });
    }
    if (product.isBestSelling) {
      labels.push({ text: "Best Selling", color: "bg-orange-500" });
    }
    if (product.isBackInStock) {
      labels.push({ text: "Back in Stock", color: "bg-blue-500" });
    }
    if (product.isPreOrder) {
      labels.push({ text: "Pre-Order", color: "bg-purple-500" });
    }

    return labels;
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <img
          src={product.images[selectedImage]}
          alt={product.title}
          className="w-full h-[500px] lg:h-[600px] object-cover rounded-lg"
        />

        {/* Product Labels */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {getProductLabels().map((label, index) => (
            <span
              key={index}
              className={`${label.color} text-white px-3 py-1 rounded-full text-sm font-medium`}
            >
              {label.text}
            </span>
          ))}
        </div>

        {/* Wishlist & Share */}
        <div className="absolute top-4 right-4 flex gap-2">
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

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/50 text-white px-3 py-2 rounded-lg flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />
            <span className="text-sm">Click to zoom</span>
          </div>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {product.images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
              selectedImage === index
                ? "border-orange-400"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <img
              src={image}
              alt={`${product.title} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
