"use client";
import React, { useEffect, useState } from "react";
import ReelCard from "./reel-card";

export default function LatestReels() {
  const reelsData = [
    {
      id: 1,
      thumbnail:
        "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
      views: "12.5K",
      likes: "1.2K",
    },
    {
      id: 2,
      thumbnail:
        "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
      views: "8.3K",
      likes: "856",
    },
    {
      id: 3,
      thumbnail:
        "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
      views: "15.7K",
      likes: "2.1K",
    },
    {
      id: 4,
      thumbnail:
        "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
      views: "22.1K",
      likes: "3.4K",
    },
    {
      id: 5,
      thumbnail:
        "https://images.pexels.com/photos/1759622/pexels-photo-1759622.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
      views: "9.8K",
      likes: "742",
    },
    {
      id: 6,
      thumbnail:
        "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
      views: "18.6K",
      likes: "2.8K",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(2); // default

  // Update cards per slide based on screen size
  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setCardsPerSlide(6);
      } else if (window.innerWidth >= 768) {
        // md breakpoint
        setCardsPerSlide(4);
      } else if (window.innerWidth >= 640) {
        // sm breakpoint
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

  const totalSlides = Math.ceil(reelsData.length / cardsPerSlide);
  const needsSlider = reelsData.length > cardsPerSlide;

  const getCurrentSlidereelsData = () => {
    const startIndex = currentSlide * cardsPerSlide;
    const endIndex = startIndex + cardsPerSlide;
    return reelsData.slice(startIndex, endIndex);
  };

  return (
    <section className="pb-16">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground">
            Latest Reels 🐾
          </h2>
          <p className="text-muted-foreground">Check out our latest content</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-10">
          {getCurrentSlidereelsData().map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
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
      </div>
    </section>
  );
}
