"use client";
import React, { useEffect, useState, useRef } from "react";
import ProductCard from "../product-card";
import { products as productData } from "@/lib/data/products";
import Loading from "../loading";

export default function RelatedProduct() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [mounted, setMounted] = useState(false);

  const products = productData.slice(0, 10);

  // Calculate total slides based on visible cards
  const getVisibleCards = () => {
    if (typeof window === "undefined") return 5;
    if (window.innerWidth >= 1280) return 5; // xl
    if (window.innerWidth >= 768) return 4; // md
    return 3;
  };

  const [visibleCards, setVisibleCards] = useState(0); // Default to prevent hydration mismatch
  const totalSlides = Math.ceil(products.length / visibleCards);

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
                    key={product.id}
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
