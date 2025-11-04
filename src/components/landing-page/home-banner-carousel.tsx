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
    desktop?: {
      text?: string;
      url?: string;
      color?: string;
      position?: { x: number; y: number } | "left" | "center" | "right";
    };
    mobile?: {
      text?: string;
      url?: string;
      color?: string;
      position?: { x: number; y: number } | "left" | "center" | "right";
    };
  };
  style?: {
    desktop?: {
      textColor?: string;
      overlayColor?: string;
      textPosition?: { x: number; y: number } | "left" | "center" | "right";
    };
    mobile?: {
      textColor?: string;
      overlayColor?: string;
      textPosition?: { x: number; y: number } | "left" | "center" | "right";
    };
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

  const mapKeywordToPercent = (pos?: "left" | "center" | "right") => {
    switch (pos) {
      case "left":
        return { x: 10, y: 50 };
      case "right":
        return { x: 90, y: 50 };
      default:
        return { x: 50, y: 50 };
    }
  };

  const getDeviceStyle = (banner: Banner) => {
    // choose mobile if available and isMobile true will be handled below
    return banner.style || {};
  };

  const normalizePosition = (
    pos: any,
    fallback: { x: number; y: number }
  ): { x: number; y: number } => {
    if (!pos) return fallback;
    if (typeof pos === "object" && typeof pos.x === "number") return pos;
    if (typeof pos === "string") return mapKeywordToPercent(pos as any);
    return fallback;
  };

  const getCurrentSettings = (banner: Banner) => {
    const styleDesktop = banner.style?.desktop;
    const styleMobile = banner.style?.mobile;
    const buttonDesktop = banner.button?.desktop;
    const buttonMobile = banner.button?.mobile;

    const style = isMobile
      ? styleMobile || styleDesktop
      : styleDesktop || styleMobile;
    const button = isMobile
      ? buttonMobile || buttonDesktop
      : buttonDesktop || buttonMobile;

    return { style, button };
  };

  const deviceSettings = getCurrentSettings(currentBanner as Banner);
  const overlayColor = deviceSettings.style?.overlayColor;

  return (
    // <div className="relative w-full h-[400px] md:h-[700px] overflow-hidden">
    <div className="relative min-h-[calc(100vh-100px)] min-w-screen overflow-hidden">
      {/* Banner Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {/* Overlay */}
        {overlayColor && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: overlayColor,
              opacity: 0.5,
            }}
          ></div>
        )}

        {/* Content */}
        <div className="relative h-full container mx-auto px-4">
          {/* Positioning: use absolute positioning with percentages coming from the banner settings */}
          {/* Text */}
          {(() => {
            const { style, button } = getCurrentSettings(
              currentBanner as Banner
            );
            const textPos = normalizePosition(style?.textPosition, {
              x: 50,
              y: 50,
            });
            const textColor = style?.textColor || "#FFFFFF";
            return (
              <>
                {currentBanner.title && (
                  <div
                    style={{
                      left: `${textPos.x}%`,
                      top: `${textPos.y}%`,
                    }}
                    className="absolute max-w-3xl transform -translate-x-1/2 -translate-y-1/2 px-4"
                  >
                    <h1
                      className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4"
                      style={{ color: textColor }}
                    >
                      {currentBanner.title}
                    </h1>
                    {currentBanner.description && (
                      <p
                        className="text-lg md:text-xl"
                        style={{ color: textColor }}
                      >
                        {currentBanner.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Button */}
                {button?.text &&
                  button?.url &&
                  (() => {
                    const btnPos = normalizePosition(button.position, {
                      x: 50,
                      y: 70,
                    });
                    return (
                      <div
                        style={{ left: `${btnPos.x}%`, top: `${btnPos.y}%` }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 px-4"
                      >
                        <a href={button.url}>
                          <Button
                            size="lg"
                            className="text-white font-semibold px-8 py-6"
                            style={{
                              backgroundColor: button.color || "#FF6B35",
                            }}
                          >
                            {button.text}
                          </Button>
                        </a>
                      </div>
                    );
                  })()}
              </>
            );
          })()}
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
