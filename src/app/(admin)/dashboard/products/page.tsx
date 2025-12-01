"use client";

import FilterCategory from "@/components/admin/products/filter-category";
import TableProduct from "@/components/admin/products/table-product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function ProductPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleAddProduct = () => {
    // Clear variant rows from localStorage
    localStorage.removeItem("variantRows");
  };

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Product Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your product catalog with pricing, inventory, and variants
        </p>
      </div>
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Button asChild onClick={handleAddProduct}>
              <Link href="/dashboard/products/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
            <FilterCategory
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 border-1 border-border focus:border-primary w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
      <TableProduct
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}
