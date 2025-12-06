"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollHorizontalCard from "../scroll-horizontal-card";
import { ProductData } from "@/lib/types/product";
import { useCurrency } from "@/context/CurrencyContext";
import { filterProductsByCountry } from "@/lib/helpers/product-filter";

export default function BackInStock() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const { userCountry } = useCurrency();

  useEffect(() => {
    const fetchBackInStockProducts = async () => {
      try {
        const response = await fetch("/api/public/back-in-stock");
        const result = await response.json();

        if (result.success) {
          // Filter products by user's country
          const filteredProducts = filterProductsByCountry(
            result.data,
            userCountry
          );
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching back in stock products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackInStockProducts();
  }, [userCountry]); // Re-fetch when country changes

  // Don't show section if no products
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground">
            Back in Stock 🐾
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Popular picks are back in stock. Don't miss out this time!
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollHorizontalCard products={products} />
        )}

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
