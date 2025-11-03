"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import ScrollHorizontalCard from "../scroll-horizontal-card";
import { ProductData } from "@/lib/types/product";
import LoadingPage from "../loading";

interface Collection {
  _id: string;
  name: string;
  rules: string;
  products: ProductData[];
}

interface HomepageData {
  allProducts: ProductData[];
  newArrivals: ProductData[];
  collections: Collection[];
}

export default function SliderFeaturedProduct() {
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [homepageData, setHomepageData] = useState<HomepageData>({
    allProducts: [],
    newArrivals: [],
    collections: [],
  });

  // Fetch homepage products and collections
  useEffect(() => {
    const fetchHomepageProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/public/homepage/products");
        const result = await response.json();
        console.log(result, "<<<<");

        if (result.success) {
          setHomepageData(result.data);
        }
      } catch (error) {
        console.error("Error fetching homepage products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageProducts();
  }, []);

  // Build tabs dynamically: All, New Arrivals, + Collections
  const tabs = [
    "All",
    "New Arrivals",
    ...homepageData.collections.map((col) => col.name),
  ];

  // Get URL path for the active tab
  const getTabPath = (tab: string) => {
    if (tab === "All") {
      return "/catalog";
    } else if (tab === "New Arrivals") {
      return "/catalog?filter=new-arrivals";
    } else {
      // For collection tabs, link to catalog filtered by collection
      const collection = homepageData.collections.find(
        (col) => col.name === tab
      );
      if (collection) {
        return `/catalog?collection=${collection._id}`;
      }
      return "/catalog";
    }
  };

  // Get products based on active tab
  const getFilteredProducts = () => {
    if (activeTab === "All") {
      return homepageData.allProducts;
    } else if (activeTab === "New Arrivals") {
      return homepageData.newArrivals;
    } else {
      // Find collection by name
      const collection = homepageData.collections.find(
        (col) => col.name === activeTab
      );
      return collection ? collection.products : [];
    }
  };

  const filteredProducts = getFilteredProducts();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      {/* Tab Badges */}
      <div className="flex flex-wrap justify-center gap-2 my-8">
        {tabs.map((tab) => (
          <Badge
            key={tab}
            className={`rounded-3xl py-2 px-3 border-primary text-primary hover:bg-primary hover:text-white duration-300 font-semibold flex items-center justify-center cursor-pointer text-center ${
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-white text-primary"
            }`}
            style={{
              minWidth: "120px",
              minHeight: "36px",
              whiteSpace: "normal",
              lineHeight: "1.2",
            }}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </Badge>
        ))}
      </div>

      <div className="relative">
        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <ScrollHorizontalCard products={filteredProducts} />
        ) : (
          <div className="text-center py-10 text-gray-500">
            No products available for {activeTab}
          </div>
        )}

        {/* View All Link */}
        {filteredProducts.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-8 border-primary text-primary hover:bg-primary hover:text-white font-semibold mt-3"
            >
              <Link href={getTabPath(activeTab)}>
                View All {activeTab === "All" ? "Products" : activeTab}
                <span>
                  <ArrowRight className="h-4 w-6" />
                </span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
