"use client";
import React, { useEffect, useState } from "react";
import { ProductData, TCurrency, VariantRow } from "@/lib/types/product";
import { Filter, ChevronRight, ChevronLeft, X } from "lucide-react";
import SortDropdown from "@/components/catalog/sort-dropdown";
import ProductGrid from "@/components/catalog/product-grid";
import FilterSidebar from "@/components/catalog/filter-sidebar";
import { useCurrency } from "@/context/CurrencyContext";

type TSelectedFilter = {
  categories: string[];
  sizes: string[];
  priceRange: [number, number];
  stocks: string;
  sortBy?: string;
};

interface MainContentProps {
  products: ProductData[];
}

const extractAttributes = (variants: VariantRow[]) => {
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

export const filterProducts = (
  products: any[],
  searchQuery: string,
  selectedFilters: TSelectedFilter,
  sortBy: string,
  currency: TCurrency
) => {
  let filtered = products.map((product: ProductData) => {
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

    const attributes = extractAttributes(variants);

    return {
      ...product,
      minPrice,
      maxPrice,
      totalStock,
      attributes,
      availableSizes: attributes["Size"] || [],
    };
  });

  // 🔍 Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((p) => p.productName.toLowerCase().includes(q));
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

export default function MainContent({ products }: MainContentProps) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<TSelectedFilter>({
    categories: [],
    sizes: [],
    priceRange: [0, 0],
    stocks: "",
    sortBy: "",
  });

  const [sortBy, setSortBy] = useState("sorting by");

  const { currency } = useCurrency();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  useEffect(() => {
    const filtered = filterProducts(
      products,
      searchQuery,
      selectedFilters, // sizes, stocks, priceRange
      sortBy,
      currency
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, selectedFilters, sortBy, currency]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const extractSizesFromVariants = (products: ProductData[]) => {
    const sizes = [] as string[];

    products.forEach((product) => {
      product.productVariantsData?.forEach((variant) => {
        const size = variant.attrs?.["Size"];

        if (size && !sizes.includes(size)) sizes.push(size.toUpperCase());
      });
    });

    return sizes;
  };

  return (
    <main className="container mx-auto px-4 py-16">
      {/* Controls */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <Filter size={18} />
              <span className="font-medium">Filters</span>
            </button>

            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {filteredProducts.length}
                </span>{" "}
                products
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {isFilterOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 ">
            <div className="fixed left-0 top-0 h-full w-80 bg-white overflow-y-auto">
              <div className="p-4 border-b">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <X size={20} />
                  <span>Close Filters</span>
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar
                  sizes={extractSizesFromVariants(products)}
                  selectedFilters={selectedFilters}
                  onFiltersChange={setSelectedFilters}
                  catagoryTab={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {currentProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <ProductGrid products={currentProducts} />
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    const showEllipsis =
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 &&
                        currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[44px] h-11 rounded-xl font-medium transition-all duration-200 ${
                          currentPage === page
                            ? "bg-orange-600 text-white shadow-lg"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
