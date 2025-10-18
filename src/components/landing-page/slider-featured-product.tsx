"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import { products as productData } from "@/lib/data/products";
import ScrollHorizontalCard from "../scroll-horizontal-card";

export default function SliderFeaturedProduct() {
  const [activeTab, setActiveTab] = useState("All");

  const products = productData;

  const tabs = ["All", "New Arrivals", "Best Sellers", "Sale"];

  // Get URL path for the active tab
  const getTabPath = (tab: string) => {
    switch (tab) {
      case "All":
        return "/catalog";
      case "New Arrivals":
        return "/catalog/new-arrivals";
      case "Best Sellers":
        return "/catalog/best-sellers";
      case "Sale":
        return "/catalog/sale";
      default:
        return "/";
    }
  };

  // Filter products based on active tab
  const filteredProducts = products.filter((product) =>
    activeTab === "All" ? product : product.tag === activeTab
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

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
              width: "120px",
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
        <ScrollHorizontalCard products={filteredProducts} />

        {/* View All Link */}
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
      </div>
    </>
  );
}
