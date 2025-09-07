export type TCurrency = "IDR" | "SGD" | "USD";
export type TStockStatus = "Ready" | "Pre-Order";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
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

// type for the landing page of the featured product section
export type TabType = "All" | "New Arrivals" | "Best Sellers" | "Sale";
