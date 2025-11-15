"use client";

import FormProduct from "@/components/admin/products/form-product";
import LoadingPage from "@/components/loading";
import ErrorPublicPage from "@/components/error-public-page";
import { getById } from "@/lib/apiService";
import { ProductData } from "@/lib/types/product";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<ProductData>("/api/admin/products", id);

      if (response.data) {
        setProduct(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPublicPage errorMessage={error} />;
  }

  if (!product) {
    return <ErrorPublicPage errorMessage="Product not found" />;
  }

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Edit Product
        </h1>
        <p className="text-muted-foreground text-lg">
          Update Product Information
        </p>
      </div>
      <FormProduct initialData={product} mode="edit" />
    </div>
  );
}
