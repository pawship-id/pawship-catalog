"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryData } from "@/lib/types/category";
import { getAll } from "@/lib/apiService";

interface FilterCategoryProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export default function FilterCategory({
  selectedCategory,
  onCategoryChange,
}: FilterCategoryProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<CategoryData>("/api/admin/categories");

      if (response.data) {
        setCategories(response.data);
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

  return (
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-48 border-1 border-border focus:border-primary">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {loading ? (
          <SelectItem value="loading-fetch-category" disabled>
            Loading ...
          </SelectItem>
        ) : error ? (
          <SelectItem value="error-fetch-category" disabled>
            ERROR: {error}
          </SelectItem>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <SelectItem key={category._id} value={category._id}>
              {category.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-categories" disabled>
            No categories available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
