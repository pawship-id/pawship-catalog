"use client";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import ProductCard from "../product-card";
import { products as productData } from "@/lib/data/products";

export default function SliderFeaturedProduct() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(2);
  const [activeTab, setActiveTab] = useState("All");

  const products = productData;

  const tabs = ["All", "New Arrivals", "Best Sellers", "Sale"];

  // Get URL path for the active tab
  const getTabPath = (tab: string) => {
    switch (tab) {
      case "All":
        return "/catalog";
      case "New Arrivals":
        return "/catalog/new-arrivals";
      case "Best Sellers":
        return "/catalog/best-sellers";
      case "Sale":
        return "/catalog/sale";
      default:
        return "/";
    }
  };

  // Filter products based on active tab
  const filteredProducts = products.filter((product) =>
    activeTab === "All" ? product : product.tag === activeTab
  );

  // Update cards per slide based on screen size
  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (window.innerWidth >= 1280) {
        setCardsPerSlide(5);
      } else if (window.innerWidth >= 1024) {
        setCardsPerSlide(4);
      } else if (window.innerWidth >= 768) {
        setCardsPerSlide(3);
      } else {
        setCardsPerSlide(2);
      }
    };

    updateCardsPerSlide();
    window.addEventListener("resize", updateCardsPerSlide);

    return () => window.removeEventListener("resize", updateCardsPerSlide);
  }, []);

  // Reset to first slide when tab changes or cards per slide changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [cardsPerSlide, activeTab]);

  const totalSlides = Math.ceil(filteredProducts.length / cardsPerSlide);
  const needsSlider = filteredProducts.length > cardsPerSlide;

  const getCurrentSlideProducts = () => {
    const startIndex = currentSlide * cardsPerSlide;
    const endIndex = startIndex + cardsPerSlide;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      {/* Tab Badges */}
      <div className="flex flex-wrap justify-center gap-2 my-8">
        {tabs.map((tab) => (
          <Badge
            key={tab}
            className={`rounded-3xl py-1 px-2 border-primary text-primary hover:bg-primary hover:text-white duration-300 w-28 h-9 font-semibold flex items-center justify-center cursor-pointer ${
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-white text-primary"
            }`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </Badge>
        ))}
      </div>

      <div className="relative">
        {/* Products Grid */}
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}
        >
          {getCurrentSlideProducts().map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Slide Indicators - Only show if slider is needed */}
        {needsSlider && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-foreground" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="flex justify-center mt-6">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl px-8 border-primary text-primary hover:bg-primary hover:text-white font-semibold mt-3"
          >
            <Link href={getTabPath(activeTab)}>
              View All {activeTab === "All" ? "Products" : activeTab}
              <span>
                <ArrowRight className="h-4 w-6" />
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
