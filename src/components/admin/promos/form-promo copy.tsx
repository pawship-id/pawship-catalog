"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  PromoData,
  PromoForm,
  PromoProduct,
  PromoVariant,
} from "@/lib/types/promo";
import { ProductData } from "@/lib/types/product";
import ProductSelectorModal from "./product-selector-modal";
import VariantDiscountItem from "./variant-discount-item";
import { createData, updateData } from "@/lib/apiService";

interface FormPromoProps {
  initialData?: PromoData;
  isEdit?: boolean;
}

// Available currencies (you can make this dynamic from settings)
const CURRENCIES = ["idr", "usd", "eur"];

export default function FormPromo({
  initialData,
  isEdit = false,
}: FormPromoProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [formData, setFormData] = useState<PromoForm>({
    promoName: initialData?.promoName || "",
    startDate:
      initialData?.startDate instanceof Date
        ? initialData.startDate.toISOString().split("T")[0]
        : initialData?.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : "",
    endDate:
      initialData?.endDate instanceof Date
        ? initialData.endDate.toISOString().split("T")[0]
        : initialData?.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
    products: initialData?.products || [],
    isActive: initialData?.isActive ?? true,
  });

  const handleBasicInfoChange = (field: keyof PromoForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductsSelected = async (selectedProducts: ProductData[]) => {
    // Convert selected products to PromoProduct format
    const promoProducts: PromoProduct[] = selectedProducts.map((product) => ({
      productId: product._id,
      productName: product.productName,
      variants:
        product.productVariantsData?.map((variant) => {
          // Initialize prices and discounts for all currencies
          const originalPrice: Record<string, number> = {};
          const discountedPrice: Record<string, number> = {};
          const discountPercentage: Record<string, number> = {};

          CURRENCIES.forEach((currency) => {
            originalPrice[currency] = variant.price[currency] || 0;
            discountedPrice[currency] = variant.price[currency] || 0;
            discountPercentage[currency] = 0; // Initialize to 0% for each currency
          });

          return {
            variantId: variant._id,
            variantName: variant.name,
            originalPrice,
            discountPercentage, // Now per currency
            discountedPrice,
            isActive: true,
            image: variant.image,
          };
        }) || [],
    }));

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, ...promoProducts],
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.productId !== productId),
    }));
  };

  const handleVariantUpdate = (
    productId: string,
    variantId: string,
    updatedVariant: PromoVariant
  ) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
        product.productId === productId
          ? {
              ...product,
              variants: product.variants.map((v) =>
                v.variantId === variantId ? updatedVariant : v
              ),
            }
          : product
      ),
    }));
  };

  const handleRemoveVariant = (productId: string, variantId: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products
        .map((product) =>
          product.productId === productId
            ? {
                ...product,
                variants: product.variants.filter(
                  (v) => v.variantId !== variantId
                ),
              }
            : product
        )
        .filter((product) => product.variants.length > 0), // Remove products with no variants
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.promoName.trim()) {
      return "Promo name is required";
    }
    if (!formData.startDate) {
      return "Start date is required";
    }
    if (!formData.endDate) {
      return "End date is required";
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return "End date must be after start date";
    }
    if (formData.products.length === 0) {
      return "Please add at least one product";
    }

    // Check if at least one variant is active
    const hasActiveVariant = formData.products.some((product) =>
      product.variants.some((v) => v.isActive)
    );
    if (!hasActiveVariant) {
      return "At least one variant must be active";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);
    try {
      if (isEdit && initialData?._id) {
        await updateData<PromoData, PromoForm>(
          "/api/admin/promos",
          initialData._id,
          formData
        );
        alert("Promo updated successfully!");
      } else {
        await createData<PromoData, PromoForm>("/api/admin/promos", formData);
        alert("Promo created successfully!");
      }
      router.push("/dashboard/promos");
    } catch (error: any) {
      console.error("Error saving promo:", error);
      alert(error.response?.data?.error || "Failed to save promo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informasi Dasar */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Informasi Dasar</h2>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="promoName">Nama Promo *</Label>
            <Input
              id="promoName"
              type="text"
              maxLength={150}
              value={formData.promoName}
              onChange={(e) =>
                handleBasicInfoChange("promoName", e.target.value)
              }
              placeholder="Masukkan nama promo"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Tanggal Mulai *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  handleBasicInfoChange("startDate", e.target.value)
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">Tanggal Berakhir *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  handleBasicInfoChange("endDate", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleBasicInfoChange("isActive", checked)
              }
            />
            <Label htmlFor="isActive">Promo Aktif</Label>
          </div>
        </div>
      </div>

      {/* Produk dalam Promo */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Produk dalam Promo Toko</h2>
          <Button
            type="button"
            onClick={() => setShowProductModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        {formData.products.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">
              Belum ada produk. Klik "Tambah Produk" untuk menambahkan.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {formData.products.map((product) => (
              <div
                key={product.productId}
                className="border rounded-lg p-4 space-y-4"
              >
                {/* Product Header */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {product.productName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {product.variants.length} variant(s)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveProduct(product.productId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Variants */}
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <VariantDiscountItem
                      key={variant.variantId}
                      variant={variant}
                      currencies={CURRENCIES}
                      onUpdate={(updatedVariant) =>
                        handleVariantUpdate(
                          product.productId,
                          variant.variantId,
                          updatedVariant
                        )
                      }
                      onRemove={() =>
                        handleRemoveVariant(
                          product.productId,
                          variant.variantId
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/promos")}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : isEdit ? "Update Promo" : "Buat Promo"}
        </Button>
      </div>

      {/* Product Selector Modal */}
      <ProductSelectorModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onConfirm={handleProductsSelected}
        excludeProductIds={formData.products.map((p) => p.productId)}
      />
    </form>
  );
}
