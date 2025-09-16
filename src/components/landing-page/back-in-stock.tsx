"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "../product-card";
import { products as productData } from "@/lib/data/products";

export default function BackInStock() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(2); // default

  // const products = [
  //   {
  //     id: "1",
  //     name: "Beary Dress",
  //     price: 45_000,
  //     originalPrice: 55_000,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rdvi-m0bdn8u5wv0i16@resize_w900_nl.webp",
  //         alt: "Beary Dress 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rdyd-m0bdn9dl4fqoe1@resize_w900_nl.webp",
  //         alt: "Beary Dress 2",
  //       },
  //     ],
  //   },
  //   {
  //     id: "2",
  //     name: "Marie Ribbon BIP White",
  //     price: 79_000,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rbk7-lnsgehfy21m0ec@resize_w900_nl.webp",
  //         alt: "Marie Ribbon BIP White 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rbl0-lnsgehfy21b28f.webp",
  //         alt: "Marie Ribbon BIP White 2",
  //       },
  //     ],
  //   },
  //   {
  //     id: "3",
  //     name: "Stacey Dress Peach",
  //     price: 175_000,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/id-11134207-7r990-lwgru5k83atp44@resize_w900_nl.webp",
  //         alt: "Stacey Dress Peach 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/id-11134207-7r98s-lwgru5k80hotd6@resize_w900_nl.webp",
  //         alt: "Stacey Dress Peach 2",
  //       },
  //     ],
  //   },
  //   {
  //     id: "4",
  //     name: "Black Lily Dress",
  //     price: 140_000,
  //     originalPrice: 154_000,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     isNew: false,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfhs-m9u10vd4sgixf5@resize_w900_nl.webp",
  //         alt: "Black Lily Dress 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfg1-m9u10v1r93f598.webp",
  //         alt: "Black Lily Dress 2",
  //       },
  //     ],
  //   },
  //   {
  //     id: "5",
  //     name: "Bella Dress",
  //     price: 188_800,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfg0-m9tz1b5iq1jw10@resize_w900_nl.webp",
  //         alt: "Bella Dress 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfif-m9tz1beyca6pc2@resize_w900_nl.webp",
  //         alt: "Bella Dress 2",
  //       },
  //     ],
  //   },
  //   {
  //     id: "6",
  //     name: "Kimono BIP Boy",
  //     price: 175_000,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rff8-m3q3uadfbeqo41@resize_w900_nl.webp",
  //         alt: "Kimono BIP Boy 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfh7-m3q3udicq5i892@resize_w900_nl.webp",
  //         alt: "Kimono BIP Boy 2",
  //       },
  //     ],
  //   },
  //   {
  //     id: "7",
  //     name: "Ginger Couple Set",
  //     price: 229_000,
  //     originalPrice: 251_900,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7reoi-m2vuxbjul4gx91@resize_w900_nl.webp",
  //         alt: "Ginger Couple Set 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rep2-m2vuxcq0vecnde@resize_w900_nl.webp",
  //         alt: "Ginger Couple Set 2",
  //       },
  //     ],
  //   },
  //   {
  //     id: "8",
  //     name: "Diva Shirt",
  //     price: 190_800,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfhh-m9zuqpo6qe7016@resize_w900_nl.webp",
  //         alt: "Diva Shirt 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rfhq-m9zuqqc1q2omb6@resize_w900_nl.webp",
  //         alt: "Diva Shirt 2",
  //       },
  //     ],
  //   },
  //   {
  //     id: "9",
  //     name: "Micky & Minnie",
  //     price: 235_000,
  //     originalPrice: 282_000,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rasf-maku9qyquxzkdf.webp",
  //         alt: "Micky & Minnie 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rate-maku9qq57hwi29@resize_w900_nl.webp",
  //         alt: "Micky & Minnie 2",
  //       },
  //     ],
  //   },
  //   {
  //     id: "10",
  //     name: "Alice BIP",
  //     price: 145_000,
  //     rating: 4.8,
  //     reviewCount: 2847,
  //     tag: "Back in Stock",
  //     images: [
  //       {
  //         id: "1a",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rd56-m7jzb8pisp2bb5@resize_w900_nl.webp",
  //         alt: "Alice BIP 1",
  //       },
  //       {
  //         id: "1b",
  //         url: "https://down-id.img.susercontent.com/file/sg-11134201-7rd3n-m7jzba3qslwx03@resize_w900_nl.webp",
  //         alt: "Alice BIP 2",
  //       },
  //     ],
  //   },
  // ];

  const products = productData.filter(
    (product) => product.tag === "Back in Stock"
  );

  // Update cards per slide based on screen size
  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (window.innerWidth >= 1280) {
        // xl breakpoint
        setCardsPerSlide(5);
      } else if (window.innerWidth >= 1024) {
        // lg breakpoint
        setCardsPerSlide(4);
      } else if (window.innerWidth >= 768) {
        // md breakpoint
        setCardsPerSlide(3);
      } else {
        setCardsPerSlide(2); // default for mobile
      }
    };

    updateCardsPerSlide();
    window.addEventListener("resize", updateCardsPerSlide);

    return () => window.removeEventListener("resize", updateCardsPerSlide);
  }, []);

  // Reset to first slide when cards per slide changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [cardsPerSlide]);

  const totalSlides = Math.ceil(products.length / cardsPerSlide);

  const getCurrentSlideProducts = () => {
    const startIndex = currentSlide * cardsPerSlide;
    const endIndex = startIndex + cardsPerSlide;
    return products.slice(startIndex, endIndex);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground">
            Back in Stock 🐾
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Popular picks are back in stock. Don’t miss out this time!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-10">
          {getCurrentSlideProducts().map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
                index === currentSlide ? "bg-foreground" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl px-8 border-primary text-primary hover:bg-primary hover:text-white font-semibold"
          >
            <Link href="/catalog">
              View All Products
              <span>
                <ArrowRight className="h-4 w-6" />
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
