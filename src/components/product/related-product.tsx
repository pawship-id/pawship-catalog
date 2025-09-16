"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "../product-card";
import { products as productData } from "@/lib/data/products";

export default function RelatedProduct() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(2); // default
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const products = productData.slice(0, 11);

  // Update cards per slide based on screen size
  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (window.innerWidth >= 1280) {
        // xl breakpoint
        setCardsPerSlide(5);
      } else if (window.innerWidth >= 1024) {
        // lg breakpoint
        setCardsPerSlide(4);
      } else if (window.innerWidth >= 768) {
        // md breakpoint
        setCardsPerSlide(3);
      } else {
        setCardsPerSlide(2); // default for mobile
      }
    };

    updateCardsPerSlide();
    window.addEventListener("resize", updateCardsPerSlide);

    return () => window.removeEventListener("resize", updateCardsPerSlide);
  }, []);

  // Reset to first slide when cards per slide changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [cardsPerSlide]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const totalSlides = Math.ceil(products.length / cardsPerSlide);

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        return prevSlide === totalSlides - 1 ? 0 : prevSlide + 1;
      });
    }, 10000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [cardsPerSlide, products.length, isAutoPlaying]);

  const totalSlides = Math.ceil(products.length / cardsPerSlide);

  const getCurrentSlideProducts = () => {
    const startIndex = currentSlide * cardsPerSlide;
    const endIndex = startIndex + cardsPerSlide;
    return products.slice(startIndex, endIndex);
  };

  const handleSlideClick = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Stop auto-play when user manually clicks

    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  };

  return (
    <section
      className="py-8"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">You May Also Like</h1>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
        {getCurrentSlideProducts().map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: totalSlides }, (_, index) => (
          <button
            key={index}
            onClick={() => handleSlideClick(index)}
            className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
              index === currentSlide ? "bg-foreground" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
