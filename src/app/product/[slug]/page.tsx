import ProductDetail from "@/components/product/product-detail";
import { detectCurrency } from "@/lib/utils/currency";
import React from "react";

// Interface Data
export interface ProductVariant {
  id: string;
  type: "size" | "color" | "pattern";
  label: string;
  value: string;
  available: boolean;
  stock: number;
}

export interface PriceBreakdown {
  quantity: number;
  discount: number;
  unitPrice: number;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  isBasicEssential: boolean;
  retailPrice: Record<string, number>;
  resellerPrice: Record<string, PriceBreakdown[]>;
  moq: Record<string, number>;
  stock: number;
  isPreOrder: boolean;
  preOrderLeadTime?: string;
  isNewArrival: boolean;
  isBestSelling: boolean;
  isBackInStock: boolean;
  variants: ProductVariant[];
  tags: string[];
  images: string[];
  careInstructions: string[];
  materials: string[];
  features: string[];
  sizingGuide: string;
  shippingInfo: Record<string, { time: string; regions: string[] }>;
  marketingKitUrl?: string;
}

export interface User {
  type: "guest" | "b2c" | "b2b";
  country: string;
  currency: string;
  resellerTier?: string;
}

// Type Data
export type Currency = "IDR" | "SGD" | "HKD" | "USD";

// MockProduct Data
export const mockProduct: Product = {
  id: "prod-001",
  sku: "TOP-GEO-001",
  title: "Georgette V-Neck Peplum Top",
  subtitle: "Elegant everyday essential",
  description:
    "A sophisticated georgette top featuring a flattering V-neckline and peplum silhouette. Perfect for both casual and formal occasions.",
  category: "Tops",
  isBasicEssential: true,
  retailPrice: {
    IDR: 250000,
    SGD: 35,
    HKD: 195,
    USD: 25,
  },
  resellerPrice: {
    IDR: [
      { quantity: 10, discount: 15, unitPrice: 212500 },
      { quantity: 30, discount: 25, unitPrice: 187500 },
      { quantity: 50, discount: 30, unitPrice: 175000 },
    ],
    SGD: [
      { quantity: 10, discount: 15, unitPrice: 29.75 },
      { quantity: 30, discount: 25, unitPrice: 26.25 },
      { quantity: 50, discount: 30, unitPrice: 24.5 },
    ],
    HKD: [
      { quantity: 10, discount: 15, unitPrice: 165.75 },
      { quantity: 30, discount: 25, unitPrice: 146.25 },
      { quantity: 50, discount: 30, unitPrice: 136.5 },
    ],
    USD: [
      { quantity: 10, discount: 15, unitPrice: 21.25 },
      { quantity: 30, discount: 25, unitPrice: 18.75 },
      { quantity: 50, discount: 30, unitPrice: 17.5 },
    ],
  },
  moq: {
    IDR: 10,
    SGD: 10,
    HKD: 10,
    USD: 10,
  },
  stock: 150,
  isPreOrder: false,
  isNewArrival: true,
  isBestSelling: true,
  isBackInStock: false,
  variants: [
    {
      id: "size-xs",
      type: "size",
      label: "Size",
      value: "XS",
      available: true,
      stock: 20,
    },
    {
      id: "size-s",
      type: "size",
      label: "Size",
      value: "S",
      available: true,
      stock: 35,
    },
    {
      id: "size-m",
      type: "size",
      label: "Size",
      value: "M",
      available: true,
      stock: 45,
    },
    {
      id: "size-l",
      type: "size",
      label: "Size",
      value: "L",
      available: true,
      stock: 30,
    },
    {
      id: "size-xl",
      type: "size",
      label: "Size",
      value: "XL",
      available: true,
      stock: 20,
    },
    {
      id: "color-peach",
      type: "color",
      label: "Color",
      value: "Peach",
      available: true,
      stock: 80,
    },
    {
      id: "color-salmon",
      type: "color",
      label: "Color",
      value: "Dark Salmon",
      available: true,
      stock: 70,
    },
  ],
  tags: ["bestseller", "new-arrival", "workwear", "casual"],
  images: [
    "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7679722/pexels-photo-7679722.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7679723/pexels-photo-7679723.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  careInstructions: [
    "Hand wash in cold water",
    "Do not bleach",
    "Hang dry in shade",
    "Iron on low heat if needed",
  ],
  materials: ["100% Georgette", "Polyester blend", "Breathable fabric"],
  features: [
    "V-neckline design",
    "Peplum silhouette",
    "Regular fit",
    "Versatile styling",
  ],
  sizingGuide: "Fits true to size. Model is wearing size S.",
  shippingInfo: {
    SEA: {
      time: "2-5 business days",
      regions: ["Singapore", "Malaysia", "Thailand"],
    },
    Others: {
      time: "7-14 business days",
      regions: ["USA", "Europe", "Australia"],
    },
  },
  marketingKitUrl:
    "https://drive.google.com/drive/folders/sample-marketing-kit",
};

const mockUser: User = {
  type: "b2b",
  country: "US",
  currency: detectCurrency(),
};

const mockCurrency: Currency = detectCurrency();

export default function ProductBySlug() {
  return (
    <ProductDetail
      product={mockProduct}
      user={mockUser}
      currency={mockCurrency}
    />
  );
}
