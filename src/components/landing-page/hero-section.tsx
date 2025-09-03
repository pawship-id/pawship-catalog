"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Premium Pet Accessories for Your Beloved Companions",
      description:
        "Discover our curated collection of stylish and comfortable pet accessories. From trendy collars to cozy costumes, we have everything to keep your furry friends happy and fashionable.",
      image:
        "/images/banner/happy-dogs-wearing-stylish-collars-and-accessories.png",
      badge: "New Arrivals",
      cta: "Shop Now",
    },
    {
      title: "Custom Pet Harnesses & Collars",
      description:
        "Create personalized accessories that reflect your pet's unique personality. Our custom collection offers endless possibilities for style and comfort.",
      image: "/images/banner/custom-pet-harness-collection.png",
      badge: "Custom Made",
      cta: "Customize Now",
    },
    {
      title: "Seasonal Pet Costumes & Outfits",
      description:
        "Dress up your furry friends for every occasion with our adorable costume collection. From Halloween to holidays, we have the perfect outfit.",
      image: "/images/banner/seasonal-pet-costumes.png",
      badge: "Limited Edition",
      cta: "Browse Costumes",
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

  const currentHero = heroSlides[currentSlide];

  return (
    <section className="relative bg-gradient-to-br from-secondary via-background to-accent/20 py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                {currentHero.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                {currentHero.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6 group">
                {currentHero.cta}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent"
              >
                View Collections
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-4">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Hero Image Carousel */}
          <div className="relative">
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-background transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-accent/30 to-primary/20 p-8">
              <Image
                src={currentHero.image || "/placeholder.svg"}
                alt={`Pawship ${currentHero.badge}`}
                width={600}
                height={500}
                className="w-full h-auto rounded-xl transition-opacity duration-500"
                priority
              />

              {/* Floating Elements */}
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <span className="text-sm font-medium text-primary">
                  {currentHero.badge}
                </span>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-accent rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-accent rounded-full"></div>
      </div>
    </section>
  );
}
