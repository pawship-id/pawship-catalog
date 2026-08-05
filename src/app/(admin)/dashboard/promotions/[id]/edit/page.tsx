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
      // A 200 with no `data` used to fall through silently and render the form on
      // empty defaults — saving then overwrote the whole document. Treat it as
      // the failure it is.
      if (!response.data) throw new Error("Promotion data is empty");
      setPromotion(response.data);
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
      ) : error || !promotion ? (
        <ErrorPage
          errorMessage={error ?? "Promotion not found"}
          url="/dashboard/promotions"
        />
      ) : (
        // `key` remounts the form when the document changes, so its state is
        // seeded from the new data on a first render rather than patched in
        // afterwards — the whole reason the Trigger dropdown came up blank.
        <FormPromotion
          key={promotion._id}
          initialData={promotion}
          promotionId={id}
        />
      )}
    </div>
  );
}
