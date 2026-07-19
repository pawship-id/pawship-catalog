"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import MoneyMapInput from "./money-map-input";
import RewardBuilder from "./reward-builder";
import type { Tier } from "@/lib/types/promotion";
import type { ProductData } from "@/lib/types/product";

interface TierBuilderProps {
  value: Tier[];
  onChange: (tiers: Tier[]) => void;
  currencies: string[];
  products: ProductData[];
}

/**
 * A promotion can define spend tiers (e.g. 300k→10%, 500k→15%). When any tier
 * exists it supersedes the top-level rewards — the engine picks the highest
 * qualifying tier for the order currency.
 */
export default function TierBuilder({
  value,
  onChange,
  currencies,
  products,
}: TierBuilderProps) {
  const tiers = value || [];

  const update = (index: number, next: Tier) =>
    onChange(tiers.map((t, i) => (i === index ? next : t)));

  const add = () => onChange([...tiers, { threshold: {}, rewards: [] }]);

  const remove = (index: number) => onChange(tiers.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {tiers.map((tier, index) => (
        <div key={index} className="rounded-md border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Tier {index + 1}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <MoneyMapInput
            label="Threshold (spend to unlock)"
            currencies={currencies}
            value={tier.threshold ?? {}}
            onChange={(threshold) => update(index, { ...tier, threshold })}
          />

          <div className="space-y-1">
            <Label className="text-sm">Tier rewards</Label>
            <RewardBuilder
              value={tier.rewards ?? []}
              onChange={(rewards) => update(index, { ...tier, rewards })}
              currencies={currencies}
              products={products}
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Add tier
      </Button>
    </div>
  );
}
