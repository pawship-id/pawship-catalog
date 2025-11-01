"use client";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ProductData } from "@/lib/types/product";
import { getAll } from "@/lib/apiService";
import MainContent from "@/components/catalog/main-content";
import Loading from "@/components/loading";

export default function CatalogProductPage() {
  const [products, setProducts] = useState<ProductData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<ProductData>("/api/admin/products");

      if (response.data) {
        setProducts(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-[60vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/c1/74/db/c174db6e709294bb56551b985a94d5cc.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Overlay hitam */}
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-primary text-primary-foreground">
              Our Collections
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold">
              Happy Picks for Your Pet’s{" "}
              <span className="text-primary">Happiness</span>
            </h1>
          </div>
        </div>
      </section>
      {loading ? (
        <Loading />
      ) : !products ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <MainContent products={products} />
      )}
    </div>
  );
}
