import ProductCard from "./product-card";
import { Badge } from "../ui/badge";

export default function FeaturedProduct() {
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
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground">
            Featured Products 🐾
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect picks for you and your pets
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 my-8">
          <Badge className="rounded-2xl p-2 bg-white text-foreground border-foreground hover:bg-foreground hover:text-white duration-300">
            New Arrivals
          </Badge>
          <Badge className="rounded-2xl py-2 px-4 bg-white text-foreground border-foreground hover:bg-foreground hover:text-white duration-300">
            Best Sellers
          </Badge>
          <Badge className="rounded-2xl p-2 bg-white text-foreground border-foreground hover:bg-foreground hover:text-white duration-300">
            Sale
          </Badge>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
