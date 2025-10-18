"use client";
import React, { useEffect, useState } from "react";
import { Product, TCurrency } from "@/lib/types/product";
import { products } from "@/lib/data/products";
import { Filter, ChevronRight, ChevronLeft, X } from "lucide-react";
import SortDropdown from "@/components/catalog/sort-dropdown";
import ProductGrid from "@/components/catalog/product-grid";
import FilterSidebar from "@/components/catalog/filter-sidebar";

type TSelectedFilter = {
  categories: string[];
  sizes: string[];
  stocks: string;
  priceRange: [number, number];
};

const mockProducts = products;

interface MainContentProps {
  slugData: string;
  type: "tag" | "category";
}

export default function MainContent({ slugData, type }: MainContentProps) {
  const [products, setProducts] = useState(
    mockProducts.filter((product) =>
      type === "tag"
        ? product.tag.toLowerCase() === slugData.toLowerCase()
        : product.category.toLowerCase() === slugData.toLowerCase()
    )
  );

  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<TSelectedFilter>({
    categories: [],
    sizes: [],
    priceRange: [0, 0],
    stocks: "",
  });
  const [sortBy, setSortBy] = useState("sorting by");

  const [currency, setCurrency] = useState<TCurrency>("IDR");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        // product.tags.some((tag) =>
        //   tag.toLowerCase().includes(searchQuery.toLowerCase())
        // )
      );
    }

    // Size filter
    if (selectedFilters.sizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.sizes.some((size: string) =>
          selectedFilters.sizes.includes(size)
        )
      );
    }

    // Price range filter
    if (
      selectedFilters.priceRange[0] !== 0 ||
      selectedFilters.priceRange[1] !== 0
    ) {
      filtered = filtered.filter((product) => {
        const price = product.price[currency];

        const [min, max] = selectedFilters.priceRange;

        if (min > 0 && max > 0) {
          return price >= min && price <= max;
        }
        if (min > 0) {
          return price >= min;
        }
        if (max > 0) {
          return price <= max;
        }
      });
    }

    // In stock filter
    if (selectedFilters.stocks) {
      filtered = filtered.filter(
        (product: Product) => product.inStock === selectedFilters.stocks
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price[currency] - b.price[currency]);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price[currency] - a.price[currency]);
        break;
      case "newest":
        filtered.sort((a, b) => (a.tag === "New Arrivals" ? -1 : 1));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

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
