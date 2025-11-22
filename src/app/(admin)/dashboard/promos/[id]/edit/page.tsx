"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PromoData } from "@/lib/types/promo";
import { getById } from "@/lib/apiService";
import FormPromo from "@/components/admin/promos/form-promo";
import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";

export default function EditPromoPage() {
  const params = useParams();
  const id = params.id as string;

  const [promo, setPromo] = useState<PromoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromo();
  }, [id]);

  const fetchPromo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getById<PromoData>("/api/admin/promos", id);

      if (response.data) {
        setPromo(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching promo:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Edit Promotion
        </h1>
        <p className="text-muted-foreground text-lg">Edit Promotion Data</p>
      </div>

      {loading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/promos" />
      ) : (
        <FormPromo initialData={promo} isEdit={true} />
      )}
    </div>
  );
}
