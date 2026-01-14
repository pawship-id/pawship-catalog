"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  content: string;
  location: string;
  picture: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "barkpup",
    content:
      "Bahannya lembut banget dan ringan, anabul aku kelihatan nyaman seharian pakai Pawship",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376755/WhatsApp_Image_2026-01-13_at_13.32.29_ahyvra.jpg",
  },
  {
    id: 2,
    name: "cloudypaws",
    content:
      "Awalnya ragu, tapi ternyata fit-nya pas dan nggak bikin anabul susah gerak.",
    location: "Indonesia",
    picture: "",
  },
  {
    id: 3,
    name: "baileysthepom",
    content:
      "Anabul aku sensitif, tapi pakai Pawship aman dan nggak bikin iritasi.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376755/WhatsApp_Image_2026-01-13_at_13.32.27_2_zidtce.jpg",
  },
  {
    id: 4,
    name: "aileemissmark",
    content:
      "Bahannya adem, jadi anabul nggak gampang gerah walau dipakai lama.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376755/WhatsApp_Image_2026-01-13_at_13.32.27_gdqmen.jpg",
  },
  {
    id: 5,
    name: "tinywoofie",
    content:
      "Warnanya cakep dan sesuai foto, kelihatan mahal tapi harganya masih masuk akal.",
    location: "Indonesia",
    picture: "",
  },
  {
    id: 6,
    name: "mochiboo",
    content: "Jahitannya rapi dan detailnya kelihatan niat.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376755/WhatsApp_Image_2026-01-13_at_13.32.27_1_tsrbx4.jpg",
  },
  {
    id: 7,
    name: "bubbalatte",
    content: "Repeat order sih ini, karena kualitasnya konsisten.",
    location: "Toronto, Canada",
    picture: "",
  },
  {
    id: 8,
    name: "snugglebean",
    content: "Bahannya halus dan nggak kaku, jadi anabul bebas gerak.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376755/WhatsApp_Image_2026-01-13_at_13.32.29_2_y6are9.jpg",
  },
  {
    id: 9,
    name: "marshymoo",
    content: "Ukurannya pas sesuai size chart.",
    location: "Indonesia",
    picture: "",
  },
  {
    id: 10,
    name: "cinnabun.pet",
    content: "Warnanya cakep dan sesuai foto.",
    location: "Indonesia",
    picture: "",
  },
  {
    id: 11,
    name: "sillybinkie",
    content: "Bagus Banget bajunyaaa!.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376862/WhatsApp_Image_2026-01-13_at_12.54.40_xrexfi.jpg",
  },
  {
    id: 12,
    name: "moscow.barkery",
    content: "Guanteng poll ini bahannya ok jugaaa.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376862/WhatsApp_Image_2026-01-13_at_13.32.25_eay6bm.jpg",
  },
  {
    id: 13,
    name: "kawaiisachi",
    content: "Bisa custom baju, pengerjaan cepet. Admin super ramah.",
    location: "Indonesia",
    picture: "",
  },
  {
    id: 14,
    name: "fangfang",
    content:
      "pas dan bisa di adjust lagi bajunya menyesuaikan lingkar dada doggie.",
    location: "Indonesia",
    picture: "",
  },
  {
    id: 15,
    name: "poccothechoco",
    content: "The fabric is super soft, my pet looks comfortable all day.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376863/WhatsApp_Image_2026-01-13_at_13.32.30_jw7xph.jpg",
  },
  {
    id: 16,
    name: "lunathepoodle",
    content: "My pet can move freely and doesn’t feel restricted at all.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376863/WhatsApp_Image_2026-01-13_at_13.32.29_1_psqgn6.jpg",
  },
  {
    id: 17,
    name: "pawpow",
    content: "Definitely repurchasing this for my pet.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376862/WhatsApp_Image_2026-01-13_at_13.32.28_s3ki2z.jpg",
  },
  {
    id: 18,
    name: "mstuesday",
    content: "Easy to put on, no stress.",
    location: "Indonesia",
    picture:
      "https://res.cloudinary.com/deqpnzfwb/image/upload/v1768376862/WhatsApp_Image_2026-01-13_at_13.32.26_gqlruq.jpg",
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

                    {/* Testimonial Image */}
                    <a
                      href={testimonial.picture}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-4 cursor-pointer overflow-hidden rounded-lg hover:opacity-90 transition-opacity max-w-[250px] mx-auto"
                    >
                      <img
                        src={
                          testimonial.picture ||
                          "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                        }
                        alt={`${testimonial.name}'s testimonial`}
                        className="w-full aspect-video object-cover"
                      />
                    </a>

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
