"use client";
import ProductCard from "./product-card";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import { TabType } from "@/lib/types/product";

export default function SliderFeaturedProduct() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(2);
  const [activeTab, setActiveTab] = useState<TabType>("All");

  const products = [
    {
      id: "1",
      name: "Magician BIP Set",
      price: 140_000,
      originalPrice: 154_000,
      rating: 4.8,
      reviewCount: 2847,
      tag: "Sale",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rdxd-m0e23s2x3gz40b@resize_w900_nl.webp",
          alt: "Magician BIP Set 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rdvx-m0e23skyeh5xaa.webp",
          alt: "Magician BIP Set 2",
        },
      ],
    },
    {
      id: "2",
      name: "Zootopia Bip Set",
      price: 145_000,
      rating: 4.8,
      reviewCount: 2847,
      tag: "New Arrivals",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7reqe-m8puuck7u9if6c.webp",
          alt: "Zootopia BIP Set 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7reqn-m8puuccq57sw45.webp",
          alt: "Zootopia BIP Set 2",
        },
      ],
    },
    {
      id: "3",
      name: "Dress Tutu Amber",
      price: 189_000,
      originalPrice: 226_800,
      rating: 4.8,
      reviewCount: 2847,
      tag: "Sale",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/id-11134207-7rbk9-mawfihyh462c0f.webp",
          alt: "Dress Tutu Amber 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/id-11134207-7rbk2-mawfihy74l5q9d@resize_w900_nl.webp",
          alt: "Dress Tutu Amber 2",
        },
      ],
    },
    {
      id: "4",
      name: "George BIP",
      price: 97_900,
      rating: 4.8,
      reviewCount: 2847,
      isNew: false,
      tag: "Best Sellers",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/id-11134207-7rbk7-m77kuke5tpbw60@resize_w900_nl.webp",
          alt: "George BIP 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/id-11134207-7rbk0-m77kuke5qw70b5@resize_w900_nl.webp",
          alt: "George BIP 2",
        },
      ],
    },
    {
      id: "5",
      name: "Cory BIP Set",
      price: 115_000,
      originalPrice: 126_500,
      rating: 4.8,
      reviewCount: 2847,
      tag: "Sale",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/id-11134207-7r98w-lro6kw3ldvpp25@resize_w900_nl.webp",
          alt: "Cory BIP Set 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/id-11134207-7r98r-lro6kw3l9o0def.webp",
          alt: "Cory BIP Set 2",
        },
      ],
    },
    {
      id: "6",
      name: "Bridgerton Tux",
      price: 140_000,
      rating: 4.8,
      reviewCount: 2847,
      tag: "Best Sellers",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rdwm-lzeclhjlhafa21@resize_w900_nl.webp",
          alt: "Bridgerton Tux 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rdxq-lzeclh7xyd10a5@resize_w900_nl.webp",
          alt: "Bridgerton Tux 2",
        },
      ],
    },
    {
      id: "7",
      name: "Bridgerton Tux",
      price: 125_000,
      originalPrice: 150_000,
      rating: 4.8,
      reviewCount: 2847,
      tag: "Sale",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfi9-m9h0d7atynk0ee.webp",
          alt: "Bridgerton Tux 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfhj-m9h0d8dyc21l00.webp",
          alt: "Bridgerton Tux 2",
        },
      ],
    },
    {
      id: "8",
      name: "Bear Tank",
      price: 118_000,
      rating: 4.8,
      reviewCount: 2847,
      tag: "New Arrivals",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfg7-m9in4fbmij2ta2@resize_w900_nl.webp",
          alt: "Bear Tank 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rffq-m9in4frfwu5ee5.webp",
          alt: "Bear Tank 2",
        },
      ],
    },
    {
      id: "9",
      name: "Tenis Couple",
      price: 139_000,
      rating: 4.8,
      reviewCount: 2847,
      tag: "Best Sellers",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rava-matk4f829fna6d.webp",
          alt: "Tenis Couple 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rat3-matk4emz1hfa18.webp",
          alt: "Tenis Couple 2",
        },
      ],
    },
    {
      id: "10",
      name: "Denna Dress",
      price: 139_000,
      originalPrice: 166_800,
      rating: 4.8,
      reviewCount: 2847,
      tag: "Sale",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfid-m9ty6r4yjhg6ff.webp",
          alt: "Denna Dress 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rffl-m9ty6rey3ijt1d.webp",
          alt: "Denna Dress 2",
        },
      ],
    },
    {
      id: "11",
      name: "Royal Couple",
      price: 229_000,
      rating: 4.8,
      reviewCount: 2847,
      tag: "New Arrivals",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rauy-matmnqyn1xwz32.webp",
          alt: "Royal Couple 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rat5-matmnqedvl8w9d.webp",
          alt: "Royal Couple 2",
        },
      ],
    },
    {
      id: "12",
      name: "Bear T-Shirt",
      price: 40_000,
      rating: 4.8,
      reviewCount: 2847,
      tag: "Best Sellers",
      images: [
        {
          id: "1a",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rccl-m6glgu988w1539.webp",
          alt: "Bear T-Shirt 1",
        },
        {
          id: "1b",
          url: "https://down-id.img.susercontent.com/file/sg-11134201-7rcd6-m6glgsyw7k6qe3.webp",
          alt: "Bear T-Shirt 2",
        },
      ],
    },
  ];

  const tabs: TabType[] = ["All", "New Arrivals", "Best Sellers", "Sale"];

  // Get URL path for the active tab
  const getTabPath = (tab: TabType) => {
    switch (tab) {
      case "All":
        return "/catalog";
      case "New Arrivals":
        return "/new-arrivals";
      case "Best Sellers":
        return "/best-sellers";
      case "Sale":
        return "/sale";
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentSlideProducts = () => {
    const startIndex = currentSlide * cardsPerSlide;
    const endIndex = startIndex + cardsPerSlide;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handleTabChange = (tab: TabType) => {
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
