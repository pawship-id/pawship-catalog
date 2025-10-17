"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { ApiResponse } from "@/lib/types/api";
import {
  ResellerCategoryData,
  ResellerCategoryForm,
} from "@/lib/types/reseller-category";
import { useRouter } from "next/navigation";
import { createData, updateData } from "@/lib/apiService";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";

interface ResellerCategoryFormProps {
  initialData?: any;
  resellerCategoryId?: string;
}

export default function FormResellerCategory({
  initialData,
  resellerCategoryId,
}: ResellerCategoryFormProps) {
  const [formData, setFormData] = useState({
    resellerCategoryName: "",
    currency: "",
    tierDiscount: [
      {
        name: "Tier 1",
        minimumQuantity: "",
        discount: "",
        categoryProduct: "",
      },
    ],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const isEditMode = !!resellerCategoryId;
  const router = useRouter();

  const updateTierPricing = (
    tierIndex: number,
    field: "discount" | "minimumQuantity" | "categoryProduct",
    value: string
  ) => {
    setFormData((prev) => {
      const newTiers = [...prev.tierDiscount];
      const tier = { ...newTiers[tierIndex] };

      tier[field] = value;

      newTiers[tierIndex] = tier;
      return {
        ...prev,
        tierDiscount: newTiers,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response: ApiResponse<ResellerCategoryData>;

      if (!isEditMode) {
        response = await createData<ResellerCategoryData, ResellerCategoryForm>(
          "/api/admin/reseller-categories",
          {
            ...formData,
            tierDiscount: formData.tierDiscount.map((item) => ({
              ...item,
              minimumQuantity: Number.parseFloat(item.minimumQuantity),
              discount: Number.parseFloat(item.discount),
            })),
          }
        );
      } else {
        response = await updateData<ResellerCategoryData, ResellerCategoryForm>(
          "/api/admin/reseller-categories",
          resellerCategoryId,
          {
            ...formData,
            tierDiscount: formData.tierDiscount.map((item) => ({
              ...item,
              minimumQuantity: Number.parseFloat(item.minimumQuantity),
              discount: Number.parseFloat(item.discount),
            })),
          }
        );
      }

      showSuccessAlert(undefined, response.message);

      router.push("/dashboard/reseller-categories");
    } catch (err: any) {
      showErrorAlert(undefined, err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        resellerCategoryName: initialData.resellerCategoryName || "",
        currency: initialData.currency || "aa",
        tierDiscount: initialData.tierDiscount || [
          {
            name: "Tier 1",
            minimumQuantity: "",
            discount: "",
            categoryProduct: "",
          },
        ],
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  return (
    <form
      className="space-y-2 md:space-y-4"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="reseller-category-name"
            className="text-base font-medium text-gray-700"
          >
            Reseller Category Name *
          </Label>
          <Input
            id="reseller-category-name"
            placeholder="Enter reseller category name"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            value={formData.resellerCategoryName}
            onChange={(e) =>
              setFormData({
                ...formData,
                resellerCategoryName: e.target.value,
              })
            }
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="currency"
            className="text-base font-medium text-gray-700"
          >
            Currency *
          </Label>
          <Select
            value={formData.currency}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                currency: value,
              })
            }
            required
          >
            <SelectTrigger
              id="currency"
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full"
            >
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {["IDR", "USD", "SGD", "HKD"].map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium text-gray-700">Status</Label>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="isActive-no"
              name="isActive"
              value="false"
              checked={formData.isActive === false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "true",
                })
              }
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
            />
            <Label htmlFor="isActive-no" className="text-sm font-normal">
              Non Active
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="isActive-true"
              name="isActive"
              value="true"
              checked={formData.isActive === true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "true",
                })
              }
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
            />
            <Label htmlFor="isActive-true" className="text-sm font-normal">
              Active
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="tierDiscount"
          className="text-base font-medium text-gray-700"
        >
          Tier Discount *
        </Label>
        {formData.tierDiscount.length ? (
          <div className="border rounded-lg p-6 mb-4">
            {formData.tierDiscount.map((tier, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-medium">Tier {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        tierDiscount: prev.tierDiscount
                          .filter((_, i) => i !== index)
                          .map((item, i) => ({
                            ...item,
                            name: `Tier ${i + 1}`,
                          })),
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label>Minimum Quantity</Label>
                    <Input
                      placeholder="0"
                      type="text"
                      className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                      value={tier.minimumQuantity.toString()}
                      onChange={(e) =>
                        updateTierPricing(
                          index,
                          "minimumQuantity",
                          e.target.value || ""
                        )
                      }
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Discount (%)</Label>
                    <Input
                      placeholder="0"
                      type="text"
                      className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                      value={tier.discount.toString()}
                      onChange={(e) =>
                        updateTierPricing(
                          index,
                          "discount",
                          e.target.value || ""
                        )
                      }
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Category Product</Label>
                    <Select
                      value={tier.categoryProduct}
                      onValueChange={(value) =>
                        updateTierPricing(index, "categoryProduct", value)
                      }
                      required
                    >
                      <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 w-full">
                        <SelectValue placeholder="Select category product" />
                      </SelectTrigger>
                      <SelectContent>
                        {["All", "Essentials"].map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          ""
        )}

        <Button
          type="button"
          className="cursor-pointer"
          onClick={() => {
            const newTierNumber = formData.tierDiscount.length + 1;
            setFormData((prev) => ({
              ...prev,
              tierDiscount: [
                ...prev.tierDiscount,
                {
                  name: `Tier ${newTierNumber}`,
                  minimumQuantity: "",
                  discount: "",
                  categoryProduct: "",
                },
              ],
            }));
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pricing Tier
        </Button>
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
              ? "Update Reseller Category"
              : "Create Reseller Category"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="px-6 w-full sm:w-auto"
          asChild
        >
          <Link href="/dashboard/reseller-categories">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
