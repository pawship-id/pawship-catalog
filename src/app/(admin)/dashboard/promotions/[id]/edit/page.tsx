"use client";
import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";
import FormPromotion from "@/components/admin/promotions/form-promotion";
import { getById } from "@/lib/apiService";
import type { PromotionData } from "@/lib/types/promotion";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function EditPromotionPage() {
  const params = useParams();
  const id = params.id as string;

  const [promotion, setPromotion] = useState<PromotionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchPromotionById = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getById<PromotionData>(
        "/api/admin/promotions",
        id
      );
      if (response.data) setPromotion(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotionById();
  }, [id]);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Edit Promotion
        </h1>
        <p className="text-muted-foreground text-lg">Edit Promotion Data</p>
      </div>

      {isLoading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/promotions" />
      ) : (
        <FormPromotion initialData={promotion} promotionId={id} />
      )}
    </div>
  );
}
