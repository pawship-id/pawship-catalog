import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products as productData } from "@/lib/data/products";
import ScrollHorizontalCard from "../scroll-horizontal-card";

export default function BackInStock() {
  const products = productData.filter(
    (product) => product.tag === "Back in Stock"
  );

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
        <ScrollHorizontalCard products={products} />

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
