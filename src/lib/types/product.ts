export interface VariantType {
  id: string;
  name: string;
}

export interface VariantRow {
  codeRow: string;
  position: number;
  image?: File | string | null;
  sku: string;
  attrs: Record<string, string>;
  name: string;
  stock?: number;
  price?: any;
  selected?: boolean;
}

export interface ProductForm {
  sku: string;
  productName: string;
  categoryId: string;
  moq: number;
  productDescription: string;
  sizeProduct?: File | string | null;
  productMedia?: File[] | null;
  tags?: string;
  exclusive: { enabled: boolean; country: string[] | null };
  preOrder: { enabled: boolean; leadTime: string };
  variantTypes?: VariantType[];
  variantRows?: VariantRow[];
  marketingLinks: string[];
}

// export interface VariantRow {
//   codeRow: string;
//   position: number;
//   image?: {
//     imageUrl?: string;
//     imagePublicId?: string;
//   };
//   sku: string;
//   attrs: Record<string, string>;
//   name: string;
//   stock?: number;
//   price?: any;
//   selected?: boolean;
// }

// export interface ProductForm {
//   sku: string;
//   productName: string;
//   categoryId: string;
//   moq: number;
//   productDescription: string;
//   sizeProduct?: {
//     imageUrl?: string;
//     imagePublicId?: string;
//   };
//   productMedia?:
//     | {
//         imageUrl?: string;
//         imagePublicId?: string;
//       }[]
//     | null;
//   tags?: string;
//   exclusive: { enabled: boolean; country: string[] | null };
//   preOrder: { enabled: boolean; leadTime: string };
//   variantTypes?: VariantType[];
//   variantRows?: VariantRow[];
//   marketingLinks: string[];
// }

export interface ProductData {
  _id: string;
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
