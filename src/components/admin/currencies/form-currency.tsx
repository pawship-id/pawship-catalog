"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { useRouter } from "next/navigation";
import { createData, updateData } from "@/lib/apiService";
import { ApiResponse } from "@/lib/types/api";
import { CurrencyData, CurrencyForm } from "@/lib/types/currency";

interface CurrencyFormProps {
  initialData?: CurrencyData | null;
  currencyId?: string;
}

const initialFormState: CurrencyForm = {
  name: "",
  baseRupiah: "",
};

export default function FormCurrency({
  initialData,
  currencyId,
}: CurrencyFormProps) {
  const [formData, setFormData] = useState<CurrencyForm>(initialFormState);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!currencyId;
  const router = useRouter();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        baseRupiah: initialData.baseRupiah ?? "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const baseRupiah = Number(formData.baseRupiah);

    if (!Number.isFinite(baseRupiah) || baseRupiah < 0) {
      showErrorAlert(undefined, "Base rupiah must be a number of 0 or more");
      return;
    }

    setLoading(true);

    const dataToSend = {
      name: formData.name.trim().toUpperCase(),
      baseRupiah,
    };

    try {
      let response: ApiResponse<CurrencyData>;

      if (!isEditMode) {
        response = await createData<CurrencyData, typeof dataToSend>(
          "/api/admin/currencies",
          dataToSend
        );
      } else {
        response = await updateData<CurrencyData, typeof dataToSend>(
          "/api/admin/currencies",
          currencyId,
          dataToSend
        );
      }

      showSuccessAlert(undefined, response.message);

      router.push("/dashboard/currencies");
    } catch (err: any) {
      showErrorAlert(undefined, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-2 md:space-y-4"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium text-gray-700">
            Currency Name *
          </Label>
          <Input
            id="name"
            placeholder="Enter currency name (e.g. USD)"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 uppercase"
            required
            autoFocus
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <small className="text-muted-foreground text-sm">
            Currency code such as USD, SGD, HKD
          </small>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="baseRupiah"
            className="text-base font-medium text-gray-700"
          >
            Base Rupiah *
          </Label>
          <Input
            id="baseRupiah"
            type="number"
            min={0}
            step="any"
            placeholder="Enter base rupiah (e.g. 18000)"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            required
            value={formData.baseRupiah}
            onChange={(e) =>
              setFormData({ ...formData, baseRupiah: e.target.value })
            }
          />
          <small className="text-muted-foreground text-sm">
            Value of 1 {formData.name.trim().toUpperCase() || "currency"} in
            rupiah
          </small>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          type="submit"
          disabled={loading}
          className="px-6 w-full sm:w-auto"
        >
          {loading
            ? "Loading..."
            : isEditMode
              ? "Update Currency"
              : "Create Currency"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="px-6 w-full sm:w-auto"
          asChild
        >
          <Link href="/dashboard/currencies">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
