"use client";
import MainContent from "@/components/catalog/slug/main-content";
import Loading from "@/components/loading";
import ErrorPublicPage from "@/components/error-public-page";
import { getById } from "@/lib/apiService";
import { CategoryData } from "@/lib/types/category";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function CatalogBySlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<CategoryData>(
        "/api/admin/categories",
        slug
      );

      if (response.data) {
        setCategory(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error || !category) {
    return <ErrorPublicPage errorMessage={error || "Page Not Found"} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-[60vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/81/4f/51/814f51c5b70e346eddeb77be1613d191.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        {/* Overlay hitam */}
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="max-w-4xl mx-auto text-center space-y-2">
            <nav className="text-lg font-medium">
              <a
                href="/catalog"
                className="text-white hover:text-primary transition-colors"
              >
                Shop
              </a>
              <span className="mx-2 text-white">{"/"}</span>
              <span className="text-white">{category.name}</span>
            </nav>
            <h1 className="text-3xl lg:text-4xl text-white">{category.name}</h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <MainContent products={category.products} />
    </div>
  );
}
