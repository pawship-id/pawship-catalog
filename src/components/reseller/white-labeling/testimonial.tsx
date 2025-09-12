"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface VideoTestimonial {
  id: string;
  title: string;
  clientName: string;
  clientCompany: string;
  videoUrl: string;
  thumbnailUrl: string;
  verified: boolean;
}

const testimonials: VideoTestimonial[] = [
  {
    id: "1",
    title: "Premium Packaging Process",
    clientName: "Sarah Johnson",
    clientCompany: "Tech Innovations Ltd",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnailUrl:
      "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800",
    verified: true,
  },
  {
    id: "2",
    title: "Global Delivery Success",
    clientName: "Michael Chen",
    clientCompany: "Global Ventures Inc",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    thumbnailUrl:
      "https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=800",
    verified: true,
  },
  {
    id: "3",
    title: "Client Experience Story",
    clientName: "Emma Rodriguez",
    clientCompany: "Creative Solutions Co",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_3mb.mp4",
    thumbnailUrl:
      "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800",
    verified: true,
  },
  {
    id: "4",
    title: "Seamless Customs Handling",
    clientName: "David Lee",
    clientCompany: "NextGen Logistics",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_4mb.mp4",
    thumbnailUrl:
      "https://images.pexels.com/photos/4484076/pexels-photo-4484076.jpeg?auto=compress&cs=tinysrgb&w=800",
    verified: true,
  },
];

export default function Testimonial() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  // ✅ Responsif: ganti jumlah item per slide berdasarkan lebar layar
  useEffect(() => {
    const updateItemsPerSlide = () => {
      const prevItemsPerSlide = itemsPerSlide;
      let newItemsPerSlide;

      if (window.innerWidth < 768) {
        newItemsPerSlide = 1; // Mobile
      } else {
        newItemsPerSlide = 2; // Tablet & Desktop
      }

      if (prevItemsPerSlide !== newItemsPerSlide) {
        setItemsPerSlide(newItemsPerSlide);

        // Adjust currentSlide to prevent blank display
        const newTotalSlides = Math.ceil(
          testimonials.length / newItemsPerSlide
        );
        if (currentSlide >= newTotalSlides) {
          setCurrentSlide(Math.max(0, newTotalSlides - 1));
        }
      }
    };

    updateItemsPerSlide(); // run sekali saat mount
    window.addEventListener("resize", updateItemsPerSlide);

    return () => window.removeEventListener("resize", updateItemsPerSlide);
  }, [itemsPerSlide, currentSlide, testimonials.length]);

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
          <div className="space-y-4 text-center mb-10 text-foreground">
            <h2 className="text-3xl font-bold">What Our Clients Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from our partners — see how we produce, pack, and
              deliver products worldwide.
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
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {getCurrentTestimonials().map((testimonial, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={testimonial.thumbnailUrl}
                        alt={testimonial.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 hover:bg-white transition-colors duration-300">
                          <Play
                            className="w-8 h-8 text-gray-800 ml-1"
                            fill="currentColor"
                          />
                        </div>
                      </div>

                      {/* Video Element (Hidden by default) */}
                      <video
                        className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
                        controls
                        preload="none"
                      >
                        <source src={testimonial.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-lg text-center font-bold text-foreground mb-2">
                        {testimonial.title}
                      </h3>
                    </div>
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
