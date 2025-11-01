"use client";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import ProductGrid from "@/components/catalog/product-grid";
import { TCurrency } from "@/lib/types/product";
import { products } from "@/lib/data/products";

const mockProducts = products.slice(0, 5);

export default function WishlistPage() {
  const [products] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");

  const [currency, setCurrency] = useState<TCurrency>("IDR");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, currency]);

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
    <div className=" bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main className="container mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-8 space-y-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Wishlist Product
          </h1>
          <p className="text-medium lg:text-lg text-muted-foreground">
            Your personal list of premium pet products you love.
          </p>
        </div>

        <div className="bg-white px-4 py-2 mb-6 rounded-lg border border-gray-200 w-fit">
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

        {/* Main Content */}
        <div className="flex gap-8">
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
                {/* <ProductGrid products={currentProducts} /> */}
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
                              ? "bg-primary text-white shadow-lg"
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
    </div>
  );
}
