"use client";
import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";
import FormCurrency from "@/components/admin/currencies/form-currency";
import { getById } from "@/lib/apiService";
import { CurrencyData } from "@/lib/types/currency";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function EditCurrencyPage() {
  const params = useParams();
  const id = params.id as string;

  const [currency, setCurrency] = useState<CurrencyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchCurrencyById = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<CurrencyData>(
        "/api/admin/currencies",
        id
      );

      if (response.data) {
        setCurrency(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencyById();
  }, [id]);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Edit Currency
        </h1>
        <p className="text-muted-foreground text-lg">Edit Currency Data</p>
      </div>

      {isLoading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/currencies" />
      ) : (
        <FormCurrency initialData={currency} currencyId={id} />
      )}
    </div>
  );
}
