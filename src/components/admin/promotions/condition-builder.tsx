"use client";
import React from "react";
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
import { Plus, Trash2 } from "lucide-react";
import MoneyMapInput from "./money-map-input";
import {
  CONDITION_TYPES,
  CUSTOMER_TYPES,
  type Condition,
  type ConditionType,
} from "@/lib/types/promotion";
import type { ProductData } from "@/lib/types/product";

const CONDITION_LABELS: Record<ConditionType, string> = {
  MINIMUM_PURCHASE: "Minimum purchase",
  CATEGORY_SPEND: "Category spend",
  BUY_PRODUCT: "Buy product (quantity)",
  CUSTOMER_TYPE: "Customer type",
  FIRST_PURCHASE: "First purchase only",
  NEW_CUSTOMER: "New customer only",
};

function defaultConditionConfig(type: ConditionType): Record<string, any> {
  switch (type) {
    case "MINIMUM_PURCHASE":
      return { minPurchase: {} };
    case "CATEGORY_SPEND":
      return { categoryId: "", categorySpend: {} };
    case "BUY_PRODUCT":
      return { productId: "", quantity: 1 };
    case "CUSTOMER_TYPE":
      return { customerType: "RETAIL" };
    default:
      return {};
  }
}

interface ConditionBuilderProps {
  value: Condition[];
  onChange: (conditions: Condition[]) => void;
  currencies: string[];
  categories: { _id: string; name: string }[];
  products: ProductData[];
}

export default function ConditionBuilder({
  value,
  onChange,
  currencies,
  categories,
  products,
}: ConditionBuilderProps) {
  const conditions = value || [];

  const update = (index: number, next: Condition) =>
    onChange(conditions.map((c, i) => (i === index ? next : c)));

  const updateConfig = (index: number, patch: Record<string, any>) =>
    update(index, {
      ...conditions[index],
      config: { ...conditions[index].config, ...patch },
    });

  const add = () =>
    onChange([...conditions, { type: "MINIMUM_PURCHASE", config: { minPurchase: {} } }]);

  const remove = (index: number) =>
    onChange(conditions.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {conditions.map((condition, index) => (
        <div key={index} className="rounded-md border border-gray-200 p-3 space-y-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <Select
              value={condition.type}
              onValueChange={(type: ConditionType) =>
                update(index, { type, config: defaultConditionConfig(type) })
              }
            >
              <SelectTrigger className="flex-1 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CONDITION_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          {condition.type === "MINIMUM_PURCHASE" && (
            <MoneyMapInput
              label="Minimum purchase per currency"
              currencies={currencies}
              value={condition.config?.minPurchase ?? {}}
              onChange={(minPurchase) => updateConfig(index, { minPurchase })}
            />
          )}

          {condition.type === "CATEGORY_SPEND" && (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-sm">Category</Label>
                <Select
                  value={condition.config?.categoryId || undefined}
                  onValueChange={(categoryId) => updateConfig(index, { categoryId })}
                >
                  <SelectTrigger className="border-gray-300 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <MoneyMapInput
                label="Required spend per currency"
                currencies={currencies}
                value={condition.config?.categorySpend ?? {}}
                onChange={(categorySpend) => updateConfig(index, { categorySpend })}
              />
            </div>
          )}

          {condition.type === "BUY_PRODUCT" && (
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[180px] space-y-1">
                <Label className="text-sm">Product</Label>
                <Select
                  value={condition.config?.productId || undefined}
                  onValueChange={(productId) => updateConfig(index, { productId })}
                >
                  <SelectTrigger className="border-gray-300 w-full">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.productName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-sm">Min qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={condition.config?.quantity ?? 1}
                  onChange={(e) =>
                    updateConfig(index, { quantity: Number(e.target.value) })
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                />
              </div>
            </div>
          )}

          {condition.type === "CUSTOMER_TYPE" && (
            <div className="space-y-1">
              <Label className="text-sm">Customer type</Label>
              <Select
                value={condition.config?.customerType ?? "RETAIL"}
                onValueChange={(customerType) => updateConfig(index, { customerType })}
              >
                <SelectTrigger className="border-gray-300 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(condition.type === "FIRST_PURCHASE" ||
            condition.type === "NEW_CUSTOMER") && (
            <p className="text-sm text-muted-foreground">
              No extra configuration required.
            </p>
          )}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Add condition
      </Button>
    </div>
  );
}
