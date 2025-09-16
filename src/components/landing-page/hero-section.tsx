"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Premium Pet Accessories for Your Beloved Companions",
      image:
        "https://i.pinimg.com/1200x/aa/54/03/aa540372b18064ac77d9d9a9b7134035.jpg",
      alt: "Discover Premium Pet Products - Happy dog with blue collar in natural setting",
      cta: "Shop Now",
      position: "left",
      buttonBg: "bg-white hover:bg-primary",
      buttonText: "text-primary hover:text-white",
      bottomPercent: 30,
      leftPercent: 15,
    },
    {
      title: "Custom Pet Harnesses & Collars",
      image:
        "https://i.pinimg.com/1200x/62/ea/81/62ea8101a217ae67e9dddf832c40554a.jpg",
      alt: "Seasonal Pet Costumes - Adorable outfits for every occasion",
      cta: "Customize Now",
      position: "center",
      buttonBg: "bg-green-600 hover:bg-green-700",
      buttonText: "text-white",
      bottomPercent: 20,
      leftPercent: 50,
    },
    {
      title: "Seasonal Pet Costumes & Outfits",
      image:
        "https://i.pinimg.com/1200x/0f/41/82/0f4182d09adb53e3ef70131ffde3b35e.jpg",
      alt: "Premium Quality Guarantee - Trusted by pet owners worldwide",
      cta: "Browse Costumes",
      position: "right",
      buttonBg: "bg-purple-600 hover:bg-purple-700",
      buttonText: "text-white",
      bottomPercent: 25,
      leftPercent: 80,
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
    <section className="relative min-h-[calc(100vh-100px)] min-w-screen overflow-hidden">
      {/* Hero Image Carousel */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroSlides[currentSlide].image || "/placeholder.svg"}
          alt={heroSlides[currentSlide].alt}
          fill
          className="w-full h-full object-cover"
          priority
        />

        {/* Dynamic CTA Button */}
        <button
          className={`absolute z-10  rounded-lg font-semibold transition-all duration-300 shadow-lg hover:scale-105 -translate-x-1/2 -translate-y-1/2 w-40 min-h-14 flex items-center justify-center text-center leading-tight ${heroSlides[currentSlide].buttonBg} ${heroSlides[currentSlide].buttonText}`}
          style={{
            bottom: `${heroSlides[currentSlide].bottomPercent}%`,
            left: `${heroSlides[currentSlide].leftPercent}%`,
          }}
        >
          <span className="break-words">{heroSlides[currentSlide].cta}</span>
        </button>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="hidden sm:block absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-background hover:scale-110 transition-all duration-300"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-background hover:scale-110 transition-all duration-300"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
