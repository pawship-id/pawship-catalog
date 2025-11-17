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
  initialData?: any;
  isEdit?: boolean;
}

// Available currencies (you can make this dynamic from settings)
const CURRENCIES = ["IDR", "SGD", "HKD", "USD"];

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
    const promoProducts: PromoProduct[] = selectedProducts.map((product) => {
      const productImage = product.productMedia.find(
        (el) => el.type === "image"
      );

      return {
        productId: product._id,
        image: productImage
          ? {
              imageUrl: productImage.imageUrl,
              imagePublicId: productImage.imagePublicId,
            }
          : undefined,
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
              stock: variant.stock,
              originalPrice,
              discountPercentage, // Now per currency
              discountedPrice,
              isActive: variant.stock > 0,
              image: variant.image,
            };
          }) || [],
      };
    });

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
      {/* Basic Information */}
      <div className="space-y-2">
        <Label
          htmlFor="promoName"
          className="text-base font-medium text-gray-700"
        >
          Promotion Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="promoName"
          placeholder="Enter promotion name"
          className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
          value={formData.promoName}
          onChange={(e) => handleBasicInfoChange("promoName", e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="startDate"
            className="text-base font-medium text-gray-700"
          >
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            value={formData.startDate}
            onChange={(e) => handleBasicInfoChange("startDate", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="endDate"
            className="text-base font-medium text-gray-700"
          >
            End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            value={formData.endDate}
            onChange={(e) => handleBasicInfoChange("endDate", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            handleBasicInfoChange("isActive", checked)
          }
          className="data-[state=unchecked]:bg-gray-200"
        />
        <Label htmlFor="isActive">Active Promo</Label>
      </div>

      {/* Products in Promotion */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-700">
          Products in Promotion
        </h2>
        <Button
          type="button"
          onClick={() => setShowProductModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {formData.products.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">
            There are no products yet. Click "Add Product" to add one.
          </p>
        </div>
      ) : (
        <div className="space-y-4 border rounded-lg p-2">
          {formData.products.map((product) => (
            <div key={product.productId} className="p-4 space-y-4">
              {/* Product Header */}
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image?.imageUrl || "/placeholder.png"}
                    alt={product.productName}
                    className="w-20 h-20 object-cover rounded border"
                  />

                  <div>
                    <h3 className="font-semibold text-base">
                      {product.productName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {product.variants.length} variant(s)
                    </p>
                  </div>
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
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/promos")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : isEdit ? "Update Promo" : "Create Promo"}
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
