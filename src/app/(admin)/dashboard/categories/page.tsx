"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import TableCategory from "@/components/admin/categories/table-category";
import Link from "next/link";
import React, { useState } from "react";

export default function CategoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Category Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your product categories and subcategories
        </p>
      </div>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <Button asChild>
            <Link href="/dashboard/categories/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Link>
          </Button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
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

      <TableCategory searchQuery={searchQuery} />
    </div>
  );
}
