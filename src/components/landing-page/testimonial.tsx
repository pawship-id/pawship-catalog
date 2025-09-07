"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  content: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    content:
      "Working with this reseller program has transformed our business. The exclusive pricing and support have been exceptional.",
    location: "Jakarta, Indonesia",
  },
  {
    id: 2,
    name: "Michael Chen",
    content:
      "The quality of products and the partnership support exceeded our expectations. Our customers love what we're offering.",
    location: "London, United Kingdom",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    content:
      "The reseller program is incredibly well-structured. We've seen a 40% increase in revenue since joining.",
    location: "Singapore, Singapore",
  },
  {
    id: 4,
    name: "David Kim",
    content:
      "Outstanding products and even better support. The exclusive pricing gives us a real competitive advantage.",
    location: "New York, United States",
  },
  {
    id: 5,
    name: "Aisha Rahman",
    content:
      "This program has helped us expand into new markets seamlessly. The training and resources provided are top-notch.",
    location: "Kuala Lumpur, Malaysia",
  },
  {
    id: 6,
    name: "Thomas Müller",
    content:
      "The reseller network is very supportive. We've built strong client relationships thanks to the excellent product lineup.",
    location: "Berlin, Germany",
  },
  {
    id: 7,
    name: "Sophia Williams",
    content:
      "Our team appreciates the fast response and guidance. We feel like true partners rather than just resellers.",
    location: "Toronto, Canada",
  },
  {
    id: 8,
    name: "Hiroshi Tanaka",
    content:
      "High-quality products and reliable delivery have boosted our brand credibility. Customers trust us more than ever.",
    location: "Tokyo, Japan",
  },
  {
    id: 9,
    name: "Carlos Mendes",
    content:
      "We’ve seen continuous growth since joining. The reseller program truly empowers small businesses like ours.",
    location: "São Paulo, Brazil",
  },
];

export default function Testimonial() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  // ✅ Responsif: ganti jumlah item per slide berdasarkan lebar layar
  useEffect(() => {
    const updateItemsPerSlide = () => {
      if (window.innerWidth < 768) {
        setItemsPerSlide(1); // Mobile
      } else {
        setItemsPerSlide(3); // Tablet & Desktop
      }
    };

    updateItemsPerSlide(); // run sekali saat mount
    window.addEventListener("resize", updateItemsPerSlide);

    return () => window.removeEventListener("resize", updateItemsPerSlide);
  }, []);

  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === totalSlides - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentSlide(currentSlide === 0 ? totalSlides - 1 : currentSlide - 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentSlide(currentSlide === totalSlides - 1 ? 0 : currentSlide + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return testimonials.slice(startIndex, startIndex + itemsPerSlide);
  };

  return (
    <section className="pt-10 pb-16">
      <div className="container mx-auto px-4">
        {/* Judul */}
        <div className="text-primary-foreground rounded-3xl">
          <div className="space-y-2 text-center mb-10 text-foreground">
            <h2 className="text-3xl font-bold">What Pawrents Say 🐾</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Loved by pets, approved by pawrents everywhere
            </p>
          </div>

          {/* Carousel */}
          <div className="relative mt-10">
            <div className="flex items-center justify-center">
              {/* Tombol Prev */}
              {totalSlides > 1 && (
                <button
                  onClick={goToPrevious}
                  className="hidden lg:flex bg-white rounded-full p-3 shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-110 mr-8"
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
              )}

              {/* Cards */}
              <div
                className={`grid gap-6 ${
                  itemsPerSlide === 1
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-3"
                }`}
              >
                {getCurrentTestimonials().map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-white rounded-xl p-6 shadow-sm relative hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold text-foreground text-lg">
                          {testimonial.name}
                        </h3>
                        <img
                          src="/images/verified.png"
                          alt=""
                          className="w-5 h-5"
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {testimonial.location}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="w-5 h-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>

                    {/* Quote Icon */}
                    <div className="absolute top-4 right-4 opacity-10">
                      <Quote className="h-12 w-12 text-gray-400" />
                    </div>

                    <blockquote className="text-gray-700 leading-relaxed mb-4">
                      "{testimonial.content}"
                    </blockquote>
                  </div>
                ))}
              </div>

              {/* Tombol Next */}
              {totalSlides > 1 && (
                <button
                  onClick={goToNext}
                  className="hidden lg:flex bg-white rounded-full p-3 shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-110 ml-8"
                  aria-label="Next testimonials"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            {totalSlides > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="bg-white lg:hidden rounded-full p-3 shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-110"
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>

                <div className="flex space-x-2">
                  {[...Array(totalSlides)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-gray-500 scale-125"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNext}
                  className="bg-white lg:hidden rounded-full p-3 shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-110"
                  aria-label="Next testimonials"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
