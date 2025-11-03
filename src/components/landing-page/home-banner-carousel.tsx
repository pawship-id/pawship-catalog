"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner {
  _id: string;
  title: string;
  description?: string;
  page: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  button?: {
    text?: string;
    url?: string;
    color?: string;
    position?: "left" | "center" | "right";
  };
  style?: {
    textColor?: string;
    overlayColor?: string;
    textPosition?: "left" | "center" | "right";
  };
}

interface HomeBannerCarouselProps {
  page?: string;
}

export default function HomeBannerCarousel({
  page = "home",
}: HomeBannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`/api/public/banners?page=${page}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setBanners(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [page]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-100px)] min-w-screen bg-gray-200 animate-pulse"></div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const imageUrl =
    isMobile && currentBanner.mobileImageUrl
      ? currentBanner.mobileImageUrl
      : currentBanner.desktopImageUrl;

  const getPositionClass = (position?: "left" | "center" | "right") => {
    switch (position) {
      case "left":
        return "justify-start text-left";
      case "right":
        return "justify-end text-right";
      default:
        return "justify-center text-center";
    }
  };

  return (
    // <div className="relative w-full h-[400px] md:h-[700px] overflow-hidden">
    <div className="relative min-h-[calc(100vh-100px)] min-w-screen overflow-hidden">
      {/* Banner Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {/* Overlay */}
        {currentBanner.style?.overlayColor && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: currentBanner.style.overlayColor,
              opacity: 0.5,
            }}
          ></div>
        )}

        {/* Content */}
        <div className="relative h-full container mx-auto px-4">
          <div
            className={`h-full flex flex-col ${getPositionClass(
              currentBanner.style?.textPosition
            )} py-12 md:py-20`}
          >
            {/* Title */}
            {currentBanner.title && (
              <h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-3xl"
                style={{
                  color: currentBanner.style?.textColor || "#FFFFFF",
                }}
              >
                {currentBanner.title}
              </h1>
            )}

            {/* Description */}
            {currentBanner.description && (
              <p
                className="text-lg md:text-xl mb-8 max-w-2xl"
                style={{
                  color: currentBanner.style?.textColor || "#FFFFFF",
                }}
              >
                {currentBanner.description}
              </p>
            )}

            {/* Button */}
            {currentBanner.button?.text && currentBanner.button?.url && (
              <div
                className={`flex ${getPositionClass(currentBanner.button.position)}`}
              >
                <a href={currentBanner.button.url}>
                  <Button
                    size="lg"
                    className="text-white font-semibold px-8 py-6"
                    style={{
                      backgroundColor: currentBanner.button.color || "#FF6B35",
                    }}
                  >
                    {currentBanner.button.text}
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Only show if multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if multiple banners */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
