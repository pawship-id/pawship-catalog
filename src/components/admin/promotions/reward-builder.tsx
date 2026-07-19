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
  FREE_GIFT_SELECTIONS,
  REWARD_TYPES,
  type Reward,
  type RewardType,
} from "@/lib/types/promotion";
import type { ProductData } from "@/lib/types/product";

const REWARD_LABELS: Record<RewardType, string> = {
  PERCENTAGE_DISCOUNT: "Percentage discount",
  FIXED_DISCOUNT: "Fixed discount",
  SHIPPING_DISCOUNT: "Shipping discount",
  FREE_SHIPPING: "Free shipping",
  FREE_GIFT: "Free gift",
};

function defaultRewardConfig(type: RewardType): Record<string, any> {
  switch (type) {
    case "PERCENTAGE_DISCOUNT":
      return { percentage: 0 };
    case "FIXED_DISCOUNT":
    case "SHIPPING_DISCOUNT":
      return { amount: {} };
    case "FREE_GIFT":
      return { selection: "AUTO", gifts: [] };
    default:
      return {};
  }
}

interface RewardBuilderProps {
  value: Reward[];
  onChange: (rewards: Reward[]) => void;
  currencies: string[];
  products: ProductData[];
  compact?: boolean;
}

export default function RewardBuilder({
  value,
  onChange,
  currencies,
  products,
  compact,
}: RewardBuilderProps) {
  const rewards = value || [];

  const update = (index: number, next: Reward) =>
    onChange(rewards.map((r, i) => (i === index ? next : r)));

  const updateConfig = (index: number, patch: Record<string, any>) =>
    update(index, { ...rewards[index], config: { ...rewards[index].config, ...patch } });

  const add = () =>
    onChange([...rewards, { type: "PERCENTAGE_DISCOUNT", config: { percentage: 0 } }]);

  const remove = (index: number) =>
    onChange(rewards.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {rewards.map((reward, index) => (
        <div key={index} className="rounded-md border border-gray-200 p-3 space-y-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <Select
              value={reward.type}
              onValueChange={(type: RewardType) =>
                update(index, { type, config: defaultRewardConfig(type) })
              }
            >
              <SelectTrigger className="flex-1 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REWARD_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {REWARD_LABELS[t]}
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

          {reward.type === "PERCENTAGE_DISCOUNT" && (
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-sm">Percentage (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="any"
                  value={reward.config?.percentage ?? ""}
                  onChange={(e) =>
                    updateConfig(index, { percentage: Number(e.target.value) })
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                />
              </div>
              {!compact && (
                <MoneyMapInput
                  label="Max discount (optional)"
                  currencies={currencies}
                  value={reward.config?.maxDiscount ?? {}}
                  onChange={(maxDiscount) => updateConfig(index, { maxDiscount })}
                />
              )}
            </div>
          )}

          {(reward.type === "FIXED_DISCOUNT" ||
            reward.type === "SHIPPING_DISCOUNT") && (
            <MoneyMapInput
              label="Amount per currency"
              currencies={currencies}
              value={reward.config?.amount ?? {}}
              onChange={(amount) => updateConfig(index, { amount })}
            />
          )}

          {reward.type === "FREE_GIFT" && (
            <FreeGiftEditor
              config={reward.config}
              products={products}
              onChange={(config) => update(index, { ...reward, config })}
            />
          )}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Add reward
      </Button>
    </div>
  );
}

function FreeGiftEditor({
  config,
  products,
  onChange,
}: {
  config: Record<string, any>;
  products: ProductData[];
  onChange: (config: Record<string, any>) => void;
}) {
  const gifts: any[] = config?.gifts ?? [];

  const setGifts = (next: any[]) => onChange({ ...config, gifts: next });

  const addGift = () =>
    setGifts([...gifts, { productId: "", variantId: "", variantName: "", quantity: 1 }]);

  const updateGift = (i: number, patch: any) =>
    setGifts(gifts.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));

  const removeGift = (i: number) => setGifts(gifts.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm">Selection mode</Label>
        <Select
          value={config?.selection ?? "AUTO"}
          onValueChange={(selection) => onChange({ ...config, selection })}
        >
          <SelectTrigger className="border-gray-300 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREE_GIFT_SELECTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Gift products</Label>
        {gifts.map((gift, i) => {
          const product = products.find((p) => p._id === gift.productId);
          const variants = product?.productVariantsData ?? [];
          return (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[160px] space-y-1">
                <span className="text-xs text-muted-foreground">Product</span>
                <Select
                  value={gift.productId || undefined}
                  onValueChange={(productId) =>
                    updateGift(i, { productId, variantId: "", variantName: "" })
                  }
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
              <div className="flex-1 min-w-[140px] space-y-1">
                <span className="text-xs text-muted-foreground">Variant</span>
                <Select
                  value={gift.variantId || undefined}
                  onValueChange={(variantId) => {
                    const v = variants.find((x) => x._id === variantId);
                    updateGift(i, { variantId, variantName: v?.name ?? "" });
                  }}
                  disabled={!variants.length}
                >
                  <SelectTrigger className="border-gray-300 w-full">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20 space-y-1">
                <span className="text-xs text-muted-foreground">Qty</span>
                <Input
                  type="number"
                  min={1}
                  value={gift.quantity ?? 1}
                  onChange={(e) =>
                    updateGift(i, { quantity: Number(e.target.value) })
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGift(i)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        })}
        <Button type="button" variant="outline" size="sm" onClick={addGift}>
          <Plus className="h-4 w-4 mr-1" /> Add gift
        </Button>
      </div>
    </div>
  );
}
