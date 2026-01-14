"use client";
import React, { useRef, useState, useEffect } from "react";
import { Quote, Star } from "lucide-react";

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
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Calculate how many cards are visible based on screen size
  const getVisibleCards = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1280) return 4; // xl - show 4 cards
    if (window.innerWidth >= 768) return 3; // md - show 3 cards
    return 2; // mobile - show 1 card
  };

  const [visibleCards, setVisibleCards] = useState(3);
  const totalSlides = Math.ceil(testimonials.length / visibleCards);

  useEffect(() => {
    setVisibleCards(getVisibleCards());

    const handleResize = () => {
      setVisibleCards(getVisibleCards());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll events to update current slide indicator
  const handleScroll = () => {
    if (!sliderRef.current || isScrolling) return;

    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 350 + 24; // card width + gap
    const slideIndex = Math.round(scrollLeft / (cardWidth * visibleCards));

    setCurrentSlide(Math.min(slideIndex, totalSlides - 1));
  };

  // Scroll to specific slide when indicator is clicked
  const scrollToSlide = (slideIndex: number) => {
    if (!sliderRef.current) return;

    setIsScrolling(true);
    const container = sliderRef.current;
    const cardWidth = 350 + 24; // card width + gap
    const scrollPosition = slideIndex * cardWidth * visibleCards;

    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    // Reset scrolling flag after animation
    setTimeout(() => {
      setIsScrolling(false);
      setCurrentSlide(slideIndex);
    }, 500);
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

          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div
              ref={sliderRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-xl p-6 shadow-sm relative hover:shadow-lg transition-all duration-300 border border-gray-100 flex-none w-[350px] snap-start flex flex-col"
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
                        testimonial.picture || "/images/No_Image_Available.jpg"
                      }
                      alt={`${testimonial.name}'s testimonial`}
                      className="w-full aspect-video object-cover"
                    />
                  </a>

                  {/* Content with fixed height */}
                  <blockquote className="text-gray-700 leading-relaxed flex-1">
                    "{testimonial.content}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

          {/* Page Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSlide(index)}
                  className={`transition-all duration-300 cursor-pointer ${
                    index === currentSlide
                      ? "w-8 h-3 bg-primary rounded-full"
                      : "w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
