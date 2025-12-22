"use client";
import React, { useEffect, useState, useRef } from "react";
import ReelCard from "./reel-card";

interface Reel {
  _id: string;
  thumbnailUrl: string;
  link: string;
  likes: number;
  views: number;
}

export default function LatestReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleCards, setVisibleCards] = useState(0);
  const [mounted, setMounted] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Fetch reels from database
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await fetch("/api/public/reels");
        const result = await response.json();

        if (result.success && result.data) {
          setReels(result.data);
        }
      } catch (error) {
        console.error("Error fetching reels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // Calculate visible cards based on screen size
  const getVisibleCards = () => {
    if (typeof window === "undefined") return 6;
    if (window.innerWidth >= 1024) return 6; // lg
    if (window.innerWidth >= 768) return 4; // md
    if (window.innerWidth >= 640) return 3; // sm
    return 2; // mobile
  };

  // Update visible cards on mount and resize
  useEffect(() => {
    setMounted(true);
    setVisibleCards(getVisibleCards());

    const handleResize = () => {
      setVisibleCards(getVisibleCards());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.ceil(reels.length / visibleCards);

  // Handle scroll events to update current slide indicator
  const handleScroll = () => {
    if (!sliderRef.current || isScrolling) return;

    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.scrollWidth / reels.length;
    const slideIndex = Math.round(scrollLeft / (cardWidth * visibleCards));

    setCurrentSlide(Math.min(slideIndex, totalSlides - 1));
  };

  // Scroll to specific slide when indicator is clicked
  const scrollToSlide = (slideIndex: number) => {
    if (!sliderRef.current) return;

    setIsScrolling(true);
    const container = sliderRef.current;
    const cardWidth = container.scrollWidth / reels.length;
    const scrollPosition = slideIndex * cardWidth * visibleCards;

    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    setTimeout(() => {
      setIsScrolling(false);
      setCurrentSlide(slideIndex);
    }, 500);
  };

  if (loading) {
    return (
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="space-y-4 text-center mb-4">
            <h2 className="text-3xl font-bold text-foreground">
              Latest Reels 🐾
            </h2>
            <p className="text-muted-foreground">
              Check out our latest content
            </p>
          </div>
          <div className="flex gap-4 overflow-hidden mt-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 aspect-[9/16] bg-gray-200 animate-pulse rounded-lg"
                style={{ width: "calc(16.666% - 14px)", minWidth: "150px" }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) {
    return null;
  }

  return (
    <section className="pb-16">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground">
            Latest Reels 🐾
          </h2>
          <p className="text-muted-foreground">Check out our latest content</p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative mt-10">
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
              {reels.map((reel) => (
                <div
                  key={reel._id}
                  className="flex-shrink-0"
                  style={{
                    width: mounted
                      ? `calc((100vw - 32px - ${(visibleCards - 1) * 16}px) / ${visibleCards} - 20px)`
                      : "calc(50% - 8px)",
                    minWidth: mounted
                      ? visibleCards === 2
                        ? "160px"
                        : visibleCards === 3
                          ? "140px"
                          : visibleCards === 4
                            ? "180px"
                            : "150px"
                      : "160px",
                    maxWidth: "200px",
                  }}
                >
                  <ReelCard reel={reel} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page Indicators */}
        {totalSlides > 0 && (
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
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
