"use client";
import React, { useEffect, useState, useRef } from "react";
import ProductCard from "../product-card";
// import { products as productData } from "@/lib/data/products";
import Loading from "../loading";
import { ProductData } from "@/lib/types/product";
import { getAll } from "@/lib/apiService";
import { hasTag } from "@/lib/helpers/product";
import LoadingPage from "../loading";
import { useCurrency } from "@/context/CurrencyContext";
import { filterProductsByCountry } from "@/lib/helpers/product-filter";

interface RelatedProductProps {
  selectedProduct: ProductData;
}

export default function RelatedProduct({
  selectedProduct,
}: RelatedProductProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [products, setProducts] = useState<ProductData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState(0); // Default to prevent hydration mismatch

  const { userCountry } = useCurrency();

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAll<ProductData>("/api/public/products");

      if (response.data) {
        let data = response.data;

        // Filter products by user's country (exclude products not available in user's country)
        data = filterProductsByCountry(data, userCountry);

        // Filter products: exclude current product
        const filteredProducts = data.filter(
          (product: ProductData) => product._id !== selectedProduct._id
        );

        // Get products from same category
        const sameCategoryProducts = filteredProducts.filter(
          (product: ProductData) =>
            product.categoryId === selectedProduct.categoryId
        );

        let relatedProducts: ProductData[] = [];

        // If same category has >= 10 products, use them
        if (sameCategoryProducts.length >= 10) {
          relatedProducts = sameCategoryProducts.slice(0, 10);
        } else {
          // If no products in same category, show best selling
          // Assuming products are already sorted by best selling or you can add sorting logic
          const bestSallerProducts = filteredProducts.filter(
            (product: ProductData) =>
              product.categoryId !== selectedProduct.categoryId &&
              hasTag(product.tags, "best sellers").isFound
          );

          console.log(bestSallerProducts);

          relatedProducts = [
            ...(sameCategoryProducts || []),
            ...(bestSallerProducts || []),
          ].slice(0, 10);
        }

        setProducts(relatedProducts);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch related products
  useEffect(() => {
    if (selectedProduct) {
      fetchRelatedProducts();
    }
  }, [selectedProduct]);

  // Calculate total slides based on visible cards
  const getVisibleCards = () => {
    if (typeof window === "undefined") return 5;
    if (window.innerWidth >= 1280) return 5; // xl
    if (window.innerWidth >= 768) return 4; // md
    return 3;
  };

  useEffect(() => {
    // Set mounted to true and initialize visibleCards on client
    setMounted(true);
    setVisibleCards(getVisibleCards());

    const handleResize = () => {
      setVisibleCards(getVisibleCards());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (!products) {
    return "";
  }

  const totalSlides = Math.ceil(products.length / visibleCards);

  // Handle scroll events to update current slide indicator
  const handleScroll = () => {
    if (!sliderRef.current || isScrolling) return;

    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.scrollWidth / products.length;
    const slideIndex = Math.round(scrollLeft / (cardWidth * visibleCards));

    setCurrentSlide(Math.min(slideIndex, totalSlides - 1));
  };

  // Scroll to specific slide when indicator is clicked
  const scrollToSlide = (slideIndex: number) => {
    if (!sliderRef.current) return;

    setIsScrolling(true);
    const container = sliderRef.current;
    const cardWidth = container.scrollWidth / products.length;
    const scrollPosition = slideIndex * cardWidth * visibleCards;

    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    // Reset scrolling flag after animation
    setTimeout(() => {
      setIsScrolling(false);
      setCurrentSlide(slideIndex);
    }, 500);
  };

  return (
    <section className="py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">You May Also Like</h1>
      </div>
      {visibleCards !== 0 ? (
        <>
          {products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-2xl font-semibold text-gray-500">
                Product Not Found
              </p>
            </div>
          ) : (
            <>
              {/* Horizontal Scroll Container */}
              <div className="relative mt-8">
                <div
                  ref={sliderRef}
                  className="overflow-x-auto pb-6 scrollbar-hide"
                  onScroll={handleScroll}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <div className="flex gap-4 px-2">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="flex-shrink-0"
                        style={{
                          width: mounted
                            ? `calc((100vw - 32px - ${
                                (visibleCards - 1) * 16
                              }px) / ${visibleCards} - 20px)`
                            : "calc(50% - 8px)",
                          minWidth: mounted
                            ? visibleCards === 3
                              ? "240px"
                              : visibleCards === 4
                                ? "260px"
                                : "200px"
                            : "280px",
                          maxWidth: "280px",
                        }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Page Indicators */}
              <div className="flex justify-center items-center space-x-2 mt-6">
                {Array.from({ length: totalSlides }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSlide(index)}
                    className={`transition-all duration-300 cursor-pointer ${
                      index === currentSlide
                        ? "w-8 h-3 bg-primary rounded-full"
                        : "w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <Loading />
      )}
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
