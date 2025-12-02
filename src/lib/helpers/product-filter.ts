import { ProductData } from "../types/product";

/**
 * Filter products based on user's country and product exclusivity
 * @param products - Array of products to filter
 * @param userCountry - ISO country code of the user (e.g., "SG", "ID", "US")
 * @returns Filtered array of products available for the user's country
 */
export const filterProductsByCountry = (
  products: ProductData[],
  userCountry: string
): ProductData[] => {
  return products.filter((product) => {
    // If product has no exclusive settings, it's available everywhere
    if (!product.exclusive || !product.exclusive.enabled) {
      return true;
    }

    // If exclusive is enabled and country list exists
    if (product.exclusive.country && Array.isArray(product.exclusive.country)) {
      // Product is excluded if user's country is in the exclusion list
      const isExcluded = product.exclusive.country.includes(userCountry);
      return !isExcluded; // Show product only if NOT excluded
    }

    // If exclusive is enabled but no country array, show the product
    return true;
  });
};
