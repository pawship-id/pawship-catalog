import React from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FeaturedCategory() {
  const categories = [
    {
      id: "1",
      name: "Bibs/Collar",
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident adipisci corporis tenetur aliquid dicta iusto sit eius libero?",
      image:
        "https://i.pinimg.com/736x/4d/e8/6b/4de86bb1f0c6c5914bfdad4dd5782236.jpg",
    },
    {
      id: "2",
      name: "Harness",
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident adipisci corporis tenetur aliquid dicta iusto sit eius libero?",
      image:
        "https://i.pinimg.com/1200x/3c/15/fa/3c15fad23ce1126c34d65740a2ebc97c.jpg",
    },
    {
      id: "3",
      name: "Custome",
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident adipisci corporis tenetur aliquid dicta iusto sit eius libero?",
      image:
        "https://i.pinimg.com/736x/a5/1e/18/a51e18e9073699372ed86a4e9a0621a4.jpg",
    },
    {
      id: "4",
      name: "Basic",
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident adipisci corporis tenetur aliquid dicta iusto sit eius libero?",
      image:
        "https://i.pinimg.com/736x/64/09/10/640910da9da9562b7647e25446b6ec39.jpg",
    },
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground">
            Shop By Categories 🐾
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our categories and find everything your pets will love
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-12 items-center mt-15">
          {categories.map((category, idx) => (
            <div
              key={idx}
              className="flex flex-col md:space-x-6 md:flex-row items-center"
            >
              <div className="h-70 overflow-hidden rounded-l-xl">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-250 object-cover rounded-l-xl"
                />
              </div>

              <div className="space-y-4 px-2 text-center my-5 md:text-start">
                <h3 className="text-xl font-bold text-foreground">
                  {category.name}
                </h3>
                <p className="text-sm">{category.description}</p>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-lg border-primary text-primary hover:bg-primary hover:text-white font-semibold"
                >
                  <Link href="/">
                    Shop Now
                    <span>
                      <ArrowRight className="h-4 w-6" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
