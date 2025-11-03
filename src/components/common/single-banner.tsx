"use client";
import { useState, useEffect } from "react";
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

interface SingleBannerProps {
  page: string;
}

export default function SingleBanner({ page }: SingleBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(null);
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
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/api/public/banners?page=${page}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            // Get first active banner
            setBanner(result.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [page]);

  if (loading) {
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-gray-200 animate-pulse"></div>
    );
  }

  if (!banner) {
    return null;
  }

  const imageUrl =
    isMobile && banner.mobileImageUrl
      ? banner.mobileImageUrl
      : banner.desktopImageUrl;

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
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      {/* Banner Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {/* Overlay */}
        {banner.style?.overlayColor && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: banner.style.overlayColor,
              opacity: 0.5,
            }}
          ></div>
        )}

        {/* Content */}
        <div className="relative h-full container mx-auto px-4">
          <div
            className={`h-full flex flex-col ${getPositionClass(
              banner.style?.textPosition
            )} py-12 md:py-16`}
          >
            {/* Title */}
            {banner.title && (
              <h1
                className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 max-w-2xl"
                style={{
                  color: banner.style?.textColor || "#FFFFFF",
                }}
              >
                {banner.title}
              </h1>
            )}

            {/* Description */}
            {banner.description && (
              <p
                className="text-base md:text-lg mb-6 max-w-xl"
                style={{
                  color: banner.style?.textColor || "#FFFFFF",
                }}
              >
                {banner.description}
              </p>
            )}

            {/* Button */}
            {banner.button?.text && banner.button?.url && (
              <div
                className={`flex ${getPositionClass(banner.button.position)}`}
              >
                <a href={banner.button.url}>
                  <Button
                    size="lg"
                    className="text-white font-semibold px-6 py-5"
                    style={{
                      backgroundColor: banner.button.color || "#FF6B35",
                    }}
                  >
                    {banner.button.text}
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
