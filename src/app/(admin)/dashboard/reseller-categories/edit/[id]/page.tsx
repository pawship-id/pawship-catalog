"use client";
import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";
import FormResellerCategory from "@/components/admin/reseller-category/form-reseller-category";
import { getById } from "@/lib/apiService";
import { ResellerCategoryData } from "@/lib/types/reseller-category";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function EditResellerCategoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [resellerCategory, setResellerCategory] =
    useState<ResellerCategoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchResellerCategoryById = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<ResellerCategoryData>(
        "/api/admin/reseller-categories",
        id
      );

      if (response.data) {
        setResellerCategory(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellerCategoryById();
  }, [id]);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Edit Reseller Category
        </h1>
        <p className="text-muted-foreground text-lg">
          Edit Reseller Category Data
        </p>
      </div>

      {isLoading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/categories" />
      ) : (
        <FormResellerCategory
          initialData={resellerCategory}
          resellerCategoryId={id}
        />
      )}
    </div>
  );
}
