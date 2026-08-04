"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import MoneyMapInput from "./money-map-input";
import RewardBuilder from "./reward-builder";
import { getTiersBasis } from "@/lib/helpers/promotion-validation";
import {
  PROMOTION_CHANNELS,
  type PromotionChannel,
  type Tier,
  type TierBasis,
} from "@/lib/types/promotion";
import type { ProductData } from "@/lib/types/product";

interface TierBuilderProps {
  value: Tier[];
  onChange: (tiers: Tier[]) => void;
  currencies: string[];
  products: ProductData[];
  /** Channels enabled on the promotion — a tier may only narrow this list. */
  promotionChannels: PromotionChannel[];
}

const CHANNEL_LABELS: Record<PromotionChannel, string> = {
  WEB: "Web",
  WHATSAPP: "WhatsApp",
};

/**
 * A promotion can define tiers (e.g. 300k→10%, 500k→15%, or 10 pcs→10%,
 * 20 pcs→20%). When any tier exists it supersedes the top-level rewards — the
 * engine picks the highest qualifying tier for the order currency and channel.
 *
 * Every tier of one promotion shares a single basis (spend or quantity), so the
 * switch below lives above the list rather than on each tier.
 */
export default function TierBuilder({
  value,
  onChange,
  currencies,
  products,
  promotionChannels,
}: TierBuilderProps) {
  const tiers = value || [];
  // The basis normally comes from the data, but an empty list carries no basis
  // — without remembering the choice, picking "Quantity" before adding the
  // first tier would silently snap back to "Spend".
  const [chosenBasis, setChosenBasis] = useState<TierBasis>("SPEND");
  const basis: TierBasis = getTiersBasis(tiers) ?? chosenBasis;

  const update = (index: number, next: Tier) =>
    onChange(tiers.map((t, i) => (i === index ? next : t)));

  const add = () =>
    onChange([
      ...tiers,
      basis === "QUANTITY"
        ? { thresholdQuantity: 1, channels: [], rewards: [] }
        : { threshold: {}, channels: [], rewards: [] },
    ]);

  const remove = (index: number) => onChange(tiers.filter((_, i) => i !== index));

  // Switching basis cannot keep the old thresholds — they mean different things.
  // Confirm first when there is something to lose.
  const switchBasis = (next: TierBasis) => {
    if (next === basis) return;
    const hasThresholds = tiers.some((t) =>
      next === "QUANTITY"
        ? Object.keys(t.threshold ?? {}).length > 0
        : t.thresholdQuantity != null
    );
    if (
      hasThresholds &&
      !window.confirm(
        "Changing the tier basis clears every threshold you have entered. Continue?"
      )
    ) {
      return;
    }
    setChosenBasis(next);
    onChange(
      tiers.map((t) =>
        next === "QUANTITY"
          ? {
              thresholdQuantity: 1,
              channels: t.channels ?? [],
              rewards: t.rewards ?? [],
            }
          : {
              threshold: {},
              channels: t.channels ?? [],
              rewards: t.rewards ?? [],
            }
      )
    );
  };

  const toggleTierChannel = (
    index: number,
    channel: PromotionChannel,
    checked: boolean
  ) => {
    const current = tiers[index].channels ?? [];
    const next = checked
      ? [...current, channel]
      : current.filter((c) => c !== channel);
    update(index, { ...tiers[index], channels: next });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Label className="text-sm">Tier basis</Label>
        <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
          {(["SPEND", "QUANTITY"] as TierBasis[]).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => switchBasis(b)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                basis === b
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-muted-foreground hover:bg-gray-50"
              }`}
            >
              {b === "SPEND" ? "Spend amount" : "Quantity (pcs)"}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground w-full">
          {basis === "QUANTITY"
            ? "Counts the total pieces in the cart — a mix of models and sizes all add up."
            : "Compares the cart subtotal in the order currency."}
        </p>
      </div>

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

          {basis === "QUANTITY" ? (
            <div className="w-40 space-y-1">
              <Label className="text-sm">Minimum quantity (pcs)</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={tier.thresholdQuantity ?? 1}
                onChange={(e) =>
                  update(index, {
                    ...tier,
                    thresholdQuantity: Number(e.target.value),
                  })
                }
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              />
            </div>
          ) : (
            <MoneyMapInput
              label="Threshold (spend to unlock)"
              currencies={currencies}
              value={tier.threshold ?? {}}
              onChange={(threshold) => update(index, { ...tier, threshold })}
            />
          )}

          <div className="space-y-1">
            <Label className="text-sm">Available on</Label>
            <div className="flex flex-wrap gap-4">
              {PROMOTION_CHANNELS.filter((c) =>
                promotionChannels.includes(c)
              ).map((channel) => (
                <label
                  key={channel}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={(tier.channels ?? []).includes(channel)}
                    onChange={(e) =>
                      toggleTierChannel(index, channel, e.target.checked)
                    }
                  />
                  {CHANNEL_LABELS[channel]}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Leave both unchecked to follow the promotion&apos;s channels.
            </p>
          </div>

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
