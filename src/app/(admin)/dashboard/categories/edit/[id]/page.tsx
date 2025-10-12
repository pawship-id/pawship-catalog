"use client";
import { getById } from "@/lib/apiService";
import { CategoryData } from "@/lib/types/category";
import { useParams } from "next/navigation";
import FormCategory from "@/components/admin/categories/form-category";
import React, { useEffect, useState } from "react";
import Error from "@/components/error";

export default function EditCategoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchCategoryById = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<CategoryData>("/api/admin/categories", id);

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
    fetchCategoryById();
  }, [id]);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Edit Category
        </h1>
        <p className="text-muted-foreground text-lg">Edit Category Data</p>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
          <p className="mt-1 text-sm text-gray-500">Please wait a moment.</p>
        </div>
      ) : error ? (
        <Error errorMessage={error} url="/dashboard/categories" />
      ) : (
        <FormCategory initialData={category} categoryId={id} />
      )}
    </div>
  );
}
