"use client";
import React, { Suspense, useEffect, useState } from "react";
import { ProductData } from "@/lib/types/product";
import { useSearchParams } from "next/navigation";
import MainContent from "@/components/catalog/main-content";
import Loading from "@/components/loading";
import ErrorPublicPage from "@/components/error-public-page";

interface CatalogData {
  products: ProductData[];
  pageTitle: string;
  pageDescription: string;
  banner?: {
    desktop: string;
    mobile: string;
  };
}

function CatalogContent() {
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [filterCategoryTab, setFilterCategoryTab] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string from search params
      const queryParams = new URLSearchParams();
      const filter = searchParams.get("filter");
      const category = searchParams.get("category");
      const collection = searchParams.get("collection");

      // Set filterCategoryTab: false if filtering by category, true otherwise
      setFilterCategoryTab(!category);

      if (filter) queryParams.append("filter", filter);
      if (category) queryParams.append("category", category);
      if (collection) queryParams.append("collection", collection);

      const queryString = queryParams.toString();
      const url = `/api/public/catalog/products${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success && result.data) {
        setCatalogData(result.data);
      } else {
        setError(result.message || "Failed to fetch products");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  // Determine banner image based on screen size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const bannerImage = catalogData?.banner
    ? isMobile
      ? catalogData.banner.mobile
      : catalogData.banner.desktop
    : "https://i.pinimg.com/1200x/c1/74/db/c174db6e709294bb56551b985a94d5cc.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-[60vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url('${bannerImage}')`,
        }}
      >
        {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
        {/* Overlay hitam */}
        {/* <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-primary text-primary-foreground">
              {catalogData?.pageTitle || "Our Collections"}
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold">
              {catalogData?.pageDescription ||
                "Happy Picks for Your Pet's Happiness"}
            </h1>
          </div>
        </div> */}
      </section>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorPublicPage errorMessage={error || "Page Not Found"} />
      ) : !catalogData || !catalogData.products.length ? (
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
        <MainContent
          filterCategory={filterCategoryTab}
          products={catalogData.products}
        />
      )}
    </div>
  );
}

export default function CatalogProductPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CatalogContent />
    </Suspense>
  );
}
