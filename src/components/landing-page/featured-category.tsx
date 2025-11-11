"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CategoryData } from "@/lib/types/category";
import { getAll } from "@/lib/apiService";
import Loading from "../loading";

export default function FeaturedCategory() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<CategoryData>("/api/admin/categories");

      if (response.data) {
        const filteredCategory = response.data.filter(
          (el) => el.isDisplayed === true
        );
        setCategories(filteredCategory);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (categories.length) {
    return (
      <section className="py-10 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="space-y-4 text-center mb-4">
            <h2 className="text-3xl font-bold text-foreground">
              Shop By Categories 🐾
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our categories and find everything your pets will love
            </p>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="grid sm:grid-cols-2 gap-12 items-center mt-15">
              {categories.map((category, idx) => (
                <div
                  key={idx}
                  className="flex flex-col lg:space-x-6 lg:flex-row items-center"
                >
                  <div className="w-70 shrink-0 overflow-hidden rounded-l-xl">
                    <div className="aspect-square w-full">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-full w-full object-cover rounded-l-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 px-2 text-center my-5 lg:text-start min-w-0">
                    <h3 className="text-xl font-bold text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm line-clamp-3">
                      {category.description}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="rounded-lg border-primary/50 text-primary hover:bg-primary hover:text-white font-semibold"
                    >
                      <Link href={`/catalog?category=${category.slug}`}>
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
          )}
        </div>
      </section>
    );
  }

  return <></>;
}
