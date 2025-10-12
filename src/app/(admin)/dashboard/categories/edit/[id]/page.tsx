"use client";
import { getById } from "@/lib/apiService";
import { CategoryData } from "@/lib/types/category";
import { useParams } from "next/navigation";
import FormCategory from "@/components/admin/categories/form-category";
import React, { useEffect, useState } from "react";
import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";

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
        <LoadingPage />
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/categories" />
      ) : (
        <FormCategory initialData={category} categoryId={id} />
      )}
    </div>
  );
}
