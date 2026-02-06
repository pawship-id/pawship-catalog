"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductData } from "@/lib/types/product";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SearchBar({ setIsSearchOpen }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch search results
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/public/search?q=${encodeURIComponent(searchQuery)}&limit=8`,
          );
          const data = await response.json();
          if (data.success) {
            setSearchResults(data.data);
          }
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleProductClick = (slug: string) => {
    setIsSearchOpen(false);
    router.push(`/product/${slug}`);
  };

  return (
    <>
      <div
        className="absolute top-0 w-[100vw] h-[100vh] flex flex-col items-center"
        onClick={() => setIsSearchOpen(false)}
      ></div>

      <div
        className="absolute flex flex-col w-full items-center"
        onClick={() => setIsSearchOpen(false)}
      >
        <div
          className="w-[90vw] max-w-3xl border-t bg-background shadow-sm rounded-b-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="container mx-auto px-4 pt-6 pb-12">
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-white rounded-full border border-gray-200 shadow-sm">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Enter Product Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-5 py-3 text-base w-full border-0 bg-white rounded-full focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-gray-400"
                  autoFocus
                />
              </div>

              {searchQuery === "" ? (
                <div className="mt-8 text-center">
                  <div className="mb-3">
                    <Search className="h-12 w-12 text-gray-300 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    You have not searched anything yet
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Start typing a product name in the input
                  </p>
                </div>
              ) : isLoading ? (
                <div className="mt-8 text-center">
                  <Loader2 className="h-8 w-8 text-gray-400 mx-auto animate-spin mb-3" />
                  <p className="text-gray-500 text-sm">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="mt-6">
                  <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product.slug!)}
                        className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={
                              product.productMedia?.find(
                                (m) => m.type === "image",
                              )?.imageUrl ||
                              product.productMedia?.[0]?.imageUrl ||
                              "/placeholder.jpg"
                            }
                            alt={product.productName}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {product.productName}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {product.productDescription}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {product.productVariantsData?.length || 0}{" "}
                                variants
                              </span>
                              <span className="text-sm font-medium text-primary">
                                Click to show detail
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
