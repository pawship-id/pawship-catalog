"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FormPromo from "@/components/admin/promos/form-promo";
import { PromoData } from "@/lib/types/promo";
import { getById } from "@/lib/apiService";

export default function EditPromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromo();
  }, [resolvedParams.id]);

  const fetchPromo = async () => {
    try {
      const response = await getById<PromoData>(
        "/api/admin/promos",
        resolvedParams.id
      );
      if (response.data) {
        setPromo(response.data);
      } else {
        setError("Promo not found");
      }
    } catch (err: any) {
      console.error("Error fetching promo:", err);
      setError(err.message || "Failed to load promo");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading promo data...</p>
        </div>
      </div>
    );
  }

  if (error || !promo) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-red-500">{error || "Promo not found"}</p>
          <button
            onClick={() => router.push("/dashboard/promos")}
            className="mt-4 text-blue-500 hover:underline"
          >
            Back to Promos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Promo</h1>
        <p className="text-gray-600 mt-2">
          Update informasi promo di bawah ini
        </p>
      </div>

      <FormPromo initialData={promo} isEdit={true} />
    </div>
  );
}
