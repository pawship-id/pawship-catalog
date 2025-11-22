import { TagData, TagForm } from "./tag";

export interface VariantType {
  id: string;
  name: string;
}

export interface VariantRowForm {
  codeRow: string;
  position: number;
  image?: {
    imageUrl?: string;
    imagePublicId?: string;
  };
  sku: string;
  attrs: Record<string, string>;
  name: string;
  productId?: string;
  stock?: number;
  price?: any;
  selected?: boolean;
}

export interface VariantRow {
  _id: string;
  codeRow: string;
  position: number;
  image?: {
    imageUrl: string;
    imagePublicId: string;
    type: string;
  };
  sku: string;
  attrs: Record<string, string>;
  name: string;
  product: ProductData;
  stock: number;
  price?: any;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductForm {
  productName: string;
  categoryId: string;
  moq: number;
  productDescription: string;
  sizeProduct?: File[];
  productMedia?: File[] | null;
  tags?: TagForm[];
  exclusive: { enabled: boolean; country: string[] | null };
  preOrder: { enabled: boolean; leadTime: string };
  variantTypes?: VariantType[];
  variantRows?: VariantRowForm[];
  marketingLinks: string[];
}

export interface ProductData {
  _id: string;
  slug: string;
  productName: string;
  categoryId: string;
  categoryDetail: {
    _id: string;
    name: string;
  };
  productDescription: string;
  productMedia: {
    imageUrl: string;
    imagePublicId: string;
    type: string;
  }[];
  preOrder: { enabled: boolean; leadTime: string };
  moq: number;
  sizeProduct?: {
    imageUrl: string;
    imagePublicId: string;
  }[];
  tags?: TagData[];
  exclusive?: { enabled: boolean; country: string[] | null };
  variantTypes?: VariantType[];
  productVariantsData?: VariantRow[];
  marketingLinks?: string[];
  resellerPricing?: {
    currency: string;
    tiers: Array<{
      name: string;
      minimumQuantity: number;
      discount: number;
      categoryProduct: string | string[];
    }>;
  };
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface EnrichedProduct {
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  attributes: Record<string, any>;
  availableSizes: string[];
}

export type TCurrency = "IDR" | "SGD" | "USD";
export type TStockStatus = "Ready" | "Pre-Order";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: "image" | "video";
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: Record<TCurrency, number>;
  originalPrice: Record<TCurrency, number> | null;
  images: ProductImage[];
  isNew?: boolean;
  tag: string;
  inStock: TStockStatus;
  sizes: string[];
}
