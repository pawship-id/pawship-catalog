import { ProductData, VariantRow } from "../types/product";
import { TagData } from "../types/tag";

export type TSelectedFilter = {
  categories: string[];
  sizes: string[];
  priceRange: [number, number];
  stocks: string;
  sortBy?: string;
};

/**
 * Process the product variant list to add additional information:
 * - MinPrice & MaxPrice based on variant
 * - TotalStock of all variants
 * - Variant attributes
 * - AvailableSizes from attributes["Size"]
 *
 * @param products Array of raw products
 * @param currency key for variant prices
 * @returns an array of products enriched with additional info
 */
export const enrichProduct = (product: ProductData, currency: string) => {
  const variants = product.productVariantsData ?? [];

  const prices = variants
    .map((v: VariantRow) => v.price?.[currency])
    .filter((p: number) => typeof p === "number");

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const totalStock = variants.reduce(
    (sum: number, v: VariantRow) => sum + (v.stock ?? 0),
    0
  );

  const attributes = extractAttributesVariant(variants);

  return {
    minPrice,
    maxPrice,
    totalStock,
    attributes,
    availableSizes: attributes["Size"] || [],
  };
};

// in function to extract attributes from each variant
export const extractAttributesVariant = (variants: VariantRow[]) => {
  let attributes: Record<string, Set<string>> = {};

  variants.forEach((el) => {
    let variantAttrs = el.attrs;

    for (let key in variantAttrs) {
      if (!attributes[key]) {
        attributes[key] = new Set<string>();
      }
      attributes[key].add(variantAttrs[key]);
    }
  });

  return Object.fromEntries(
    Object.entries(attributes).map(([k, v]) => [k, [...v]])
  );
};

// this function is to extract custom size from each product
export const extractSizesFromProduct = (products: ProductData[]) => {
  const sizes = [] as string[];

  products.forEach((product) => {
    product.productVariantsData?.forEach((variant) => {
      const size = variant.attrs?.["Size"];

      if (size && !sizes.includes(size)) sizes.push(size.toUpperCase());
    });
  });

  return sizes;
};

// function contains logic filter products
export const filterProducts = (
  products: any[],
  searchQuery: string,
  selectedFilters: TSelectedFilter,
  sortBy: string,
  currency: string
) => {
  let filtered = products.map((product) => ({
    ...product,
    ...enrichProduct(product, currency),
  }));

  // 🔍 Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((p) => p.productName.toLowerCase().includes(q));
  }

  // Category
  if (selectedFilters.categories.length > 0) {
    filtered = filtered.filter(
      (p) =>
        p.categoryDetail &&
        selectedFilters.categories.includes(p.categoryDetail.name)
    );
  }

  // 📏 Size
  if (selectedFilters.sizes.length > 0) {
    filtered = filtered.filter((p) =>
      p.availableSizes.some((s: string) => selectedFilters.sizes.includes(s))
    );
  }

  // 💰 Price
  const [min, max] = selectedFilters.priceRange;
  if (min || max) {
    filtered = filtered.filter((p) => {
      if (min && max) return p.minPrice >= min && p.minPrice <= max;
      if (min) return p.minPrice >= min;
      if (max) return p.minPrice <= max;
      return true;
    });
  }

  // 📦 Stock Filter ✅
  if (selectedFilters.stocks) {
    if (selectedFilters.stocks === "Ready") {
      filtered = filtered.filter((p) => p.totalStock >= 1);
    } else if (selectedFilters.stocks === "Pre-Order") {
      filtered = filtered.filter((p) => p.totalStock < 1);
    }
  }

  // 🔽 Sorting
  switch (sortBy) {
    case "price-low":
      filtered.sort((a, b) => a.minPrice - b.minPrice);
      break;
    case "price-high":
      filtered.sort((a, b) => b.minPrice - a.minPrice);
      break;
    case "newest":
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "name":
      filtered.sort((a, b) => a.productName.localeCompare(b.productName));
      break;
  }

  return filtered;
};

// function to check whether the arrival is new (<= 30 days) or not
export const isNewArrival = (createdAt: string | Date) => {
  const createdDate = new Date(createdAt);
  const now = new Date();

  const diffInMs = createdDate.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays <= 30;
};

// function to check certain tags on a product
export const hasTag = (
  productTags: TagData[] = [],
  tagToCheck: string
): { tagToCheck: string; isFound: boolean } => {
  const lowerCheckTags = [tagToCheck].map((tag) => tag.toLowerCase());

  const lowerProductTags = productTags.map((tag) => tag.tagName.toLowerCase());

  let result = {
    tagToCheck: tagToCheck,
    isFound: lowerProductTags.some((tag) => lowerCheckTags.includes(tag)),
  };

  return result;
};
