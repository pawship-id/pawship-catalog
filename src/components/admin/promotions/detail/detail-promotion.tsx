"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit } from "lucide-react";
import { currencyFormat } from "@/lib/helpers";
import type {
  Condition,
  MoneyMap,
  PromotionData,
  Reward,
} from "@/lib/types/promotion";

function money(map?: MoneyMap): string {
  if (!map || Object.keys(map).length === 0) return "—";
  return Object.entries(map)
    .map(([c, v]) => currencyFormat(Number(v), c))
    .join(" · ");
}

function describeReward(r: Reward): string {
  switch (r.type) {
    case "PERCENTAGE_DISCOUNT":
      return `${r.config?.percentage ?? 0}% off${
        r.config?.maxDiscount ? ` (max ${money(r.config.maxDiscount)})` : ""
      }`;
    case "FIXED_DISCOUNT":
      return `${money(r.config?.amount)} off`;
    case "SHIPPING_DISCOUNT":
      return `${money(r.config?.amount)} shipping off`;
    case "FREE_SHIPPING":
      return "Free shipping";
    case "FREE_GIFT":
      return `Free gift (${r.config?.selection ?? "AUTO"}, ${
        r.config?.gifts?.length ?? 0
      } item(s))`;
    default:
      return r.type;
  }
}

function describeCondition(c: Condition): string {
  switch (c.type) {
    case "MINIMUM_PURCHASE":
      return `Minimum purchase ${money(c.config?.minPurchase)}`;
    case "CATEGORY_SPEND":
      return `Category spend ${money(c.config?.categorySpend)}`;
    case "BUY_PRODUCT":
      return `Buy at least ${c.config?.quantity ?? 1} of a product`;
    case "CUSTOMER_TYPE":
      return `Customer type: ${c.config?.customerType ?? ""}`;
    case "FIRST_PURCHASE":
      return "First purchase only";
    case "NEW_CUSTOMER":
      return "New customer only";
    default:
      return c.type;
  }
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default function DetailPromotion({
  promotion,
}: {
  promotion: PromotionData;
}) {
  const rules = promotion.customerRules;
  const activeRules = [
    rules?.firstPurchaseOnly && "First purchase only",
    rules?.newCustomerOnly && "New customer only",
    rules?.resellerOnly && "Reseller only",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">{promotion.name}</h2>
            <Badge variant="outline" className="font-mono">
              {promotion.code}
            </Badge>
            <Badge>{promotion.trigger === "CODE" ? "Voucher" : "Promotion"}</Badge>
          </div>
          {promotion.description && (
            <p className="text-muted-foreground">{promotion.description}</p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/promotions/${promotion._id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Status" value={promotion.status} />
            <Row label="Trigger" value={promotion.trigger} />
            <Row label="Priority" value={promotion.priority} />
            <Row label="Stackable" value={promotion.stackable ? "Yes" : "No"} />
            <Row
              label="Active period"
              value={`${new Date(promotion.startAt).toLocaleString()} → ${new Date(
                promotion.endAt
              ).toLocaleString()}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limits & Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Max discount / order" value={money(promotion.limits?.maxDiscount)} />
            <Row
              label="Max usage / customer"
              value={promotion.limits?.maxUsagePerCustomer ?? "Unlimited"}
            />
            <Row
              label="Total quota"
              value={promotion.limits?.totalQuota ?? "Unlimited"}
            />
            <Row label="Used" value={promotion.usedCount ?? 0} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applies To</CardTitle>
          <CardDescription>Scope of products this promotion targets</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {promotion.appliesTo?.scope === "ALL"
              ? "All products"
              : `${promotion.appliesTo?.scope} — ${
                  promotion.appliesTo?.ids?.length ?? 0
                } item(s) selected`}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(promotion.conditions ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No conditions</p>
            ) : (
              promotion.conditions.map((c, i) => (
                <div key={i} className="text-sm rounded border px-3 py-2">
                  {describeCondition(c)}
                </div>
              ))
            )}
            {activeRules.length > 0 && (
              <div className="pt-2">
                {activeRules.map((r) => (
                  <Badge key={r} variant="secondary" className="mr-2">
                    {r}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(promotion.rewards ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {(promotion.tiers ?? []).length > 0
                  ? "Defined per tier below"
                  : "No rewards"}
              </p>
            ) : (
              promotion.rewards.map((r, i) => (
                <div key={i} className="text-sm rounded border px-3 py-2">
                  {describeReward(r)}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {(promotion.tiers ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spend Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {promotion.tiers.map((t, i) => (
              <div key={i} className="text-sm rounded border px-3 py-2">
                <span className="font-medium">Spend {money(t.threshold)}</span> →{" "}
                {(t.rewards ?? []).map(describeReward).join(", ") || "—"}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
