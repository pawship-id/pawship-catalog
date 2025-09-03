"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HeroSection2() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image:
        "https://i.pinimg.com/1200x/aa/54/03/aa540372b18064ac77d9d9a9b7134035.jpg",
      alt: "Discover Premium Pet Products - Happy dog with blue collar in natural setting",
    },
    {
      image:
        "https://i.pinimg.com/1200x/c1/f4/49/c1f44969b4eab486fb51b9501792fdc1.jpg",
      alt: "Custom Pet Accessories - Personalized harnesses and collars",
    },
    {
      image:
        "https://i.pinimg.com/736x/8e/72/94/8e7294e15a111110d247a70deda4b53a.jpg",
      alt: "Seasonal Pet Costumes - Adorable outfits for every occasion",
    },
    {
      image: "/hero-premium-quality-guarantee.png",
      alt: "Premium Quality Guarantee - Trusted by pet owners worldwide",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  return (
    // <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
    <section className="relative min-h-[calc(100vh-85px)] lg:min-h-[calc(100vh-100px)] min-w-screen overflow-hidden">
      {/* Hero Image Carousel */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroSlides[currentSlide].image || "/placeholder.svg"}
          alt={heroSlides[currentSlide].alt}
          fill
          className="w-full h-full object-cover"
          priority
        />

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-background transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-background transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
