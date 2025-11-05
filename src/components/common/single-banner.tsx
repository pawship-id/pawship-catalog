"use client";
import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Banner {
  _id: string;
  page: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  button?: {
    text: string;
    url: string;
    color: string;
    position: {
      desktop: {
        horizontal: "left" | "center" | "right";
        vertical: "top" | "center" | "bottom";
      };
      mobile?: {
        horizontal: "left" | "center" | "right";
        vertical: "top" | "center" | "bottom";
      };
    };
  };
  order: number;
  isActive: boolean;
}

interface SingleBannerProps {
  page: string;
  children?: ReactNode;
}

export default function SingleBanner({ page, children }: SingleBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
          if (result.data?.length > 0) {
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
      <div className="relative h-[60vh] overflow-hidden bg-gray-200 animate-pulse" />
    );
  }

  if (!banner) return null;

  const imageUrl =
    isMobile && banner.mobileImageUrl
      ? banner.mobileImageUrl
      : banner.desktopImageUrl;

  const getButtonPositionClasses = () => {
    if (!banner.button) return "";

    const position =
      isMobile && banner.button.position.mobile
        ? banner.button.position.mobile
        : banner.button.position.desktop;

    const horizontalMap = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };

    const verticalMap = {
      top: "items-start",
      center: "items-center",
      bottom: "items-end",
    };

    return `${horizontalMap[position.horizontal]} ${verticalMap[position.vertical]}`;
  };

  return (
    <section className="relative h-[60vh] overflow-hidden bg-cover bg-center">
      {/* Banner Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Button */}
      {banner.button && (
        <div
          className={`absolute inset-0 flex p-8 md:p-12 lg:p-16 ${getButtonPositionClasses()}`}
        >
          <a href={banner.button.url}>
            <Button
              size="lg"
              className="text-white font-semibold px-8 py-6 text-lg"
              style={{
                backgroundColor: banner.button.color || "#FF6B35",
              }}
            >
              {banner.button.text}
            </Button>
          </a>
        </div>
      )}

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </section>
  );
}
