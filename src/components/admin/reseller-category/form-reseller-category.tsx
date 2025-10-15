"use client";
import React, { useState } from "react";
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

export default function FormResellerCategory() {
  const [formData, setFormData] = useState({
    resellerCategoryName: "",
    currency: "",
    tierDiscount: {
      tiers: [
        {
          name: "Tier 1",
          minimumQuantity: 0,
          discount: 0,
          categoryProduct: "all",
        },
      ],
    },
  });

  const updateTierPricing = (
    tierIndex: number,
    field: string,
    value: number
  ) => {
    setFormData((prev) => {
      const newTiers = [...prev.tierDiscount.tiers];
      const tier = { ...newTiers[tierIndex] };

      if (field === "discount") {
        tier.discount = value;
      } else if (field === "minimumQuantity") {
        tier.minimumQuantity = value;
      }

      newTiers[tierIndex] = tier;
      return {
        ...prev,
        tierDiscount: {
          ...prev.tierDiscount,
          tiers: newTiers,
        },
      };
    });
  };

  return (
    <form className="space-y-2 md:space-y-4" autoComplete="off">
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
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium text-gray-700">
            Currency *
          </Label>
          <Select required>
            <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full">
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
        <Label htmlFor="name" className="text-base font-medium text-gray-700">
          Tier Discount *
        </Label>
        {formData.tierDiscount.tiers.map((tier, index) => (
          <div key={index} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium">{tier.name}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    tierDiscount: {
                      ...prev.tierDiscount,
                      tiers: prev.tierDiscount.tiers.filter(
                        (_, i) => i !== index
                      ),
                    },
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
                  type="number"
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  value={tier.minimumQuantity}
                  onChange={(e) =>
                    updateTierPricing(
                      index,
                      "minimumQuantity",
                      Number.parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="space-y-3">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  step="0.1"
                  value={tier.discount}
                  onChange={(e) =>
                    updateTierPricing(
                      index,
                      "discount",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="space-y-3">
                <Label>Category Product</Label>
                <Select required>
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

        <Button
          type="button"
          className="cursor-pointer"
          onClick={() => {
            const newTierNumber = formData.tierDiscount.tiers.length + 1;
            setFormData((prev) => ({
              ...prev,
              tierDiscount: {
                ...prev.tierDiscount,
                tiers: [
                  ...prev.tierDiscount.tiers,
                  {
                    name: `Tier ${newTierNumber}`,
                    minimumQuantity: 0,
                    discount: 0,
                    categoryProduct: "all",
                  },
                ],
              },
            }));
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pricing Tier
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button type="submit" className="px-6 w-full sm:w-auto">
          Create Reseller Category
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
