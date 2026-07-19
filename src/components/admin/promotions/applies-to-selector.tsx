"use client";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { APPLIES_TO_SCOPES, type AppliesTo, type AppliesToScope } from "@/lib/types/promotion";
import type { ProductData } from "@/lib/types/product";

const SCOPE_LABELS: Record<AppliesToScope, string> = {
  ALL: "All products",
  PRODUCTS: "Selected products",
  VARIANTS: "Selected variants",
  CATEGORIES: "Selected categories",
  BRANDS: "Selected brands (coming soon)",
};

interface Option {
  id: string;
  label: string;
}

interface AppliesToSelectorProps {
  value: AppliesTo;
  onChange: (value: AppliesTo) => void;
  products: ProductData[];
  categories: { _id: string; name: string }[];
}

export default function AppliesToSelector({
  value,
  onChange,
  products,
  categories,
}: AppliesToSelectorProps) {
  const [search, setSearch] = useState("");
  const scope = value?.scope ?? "ALL";
  const ids = value?.ids ?? [];

  const options: Option[] = useMemo(() => {
    switch (scope) {
      case "PRODUCTS":
        return products.map((p) => ({ id: p._id, label: p.productName }));
      case "VARIANTS":
        return products.flatMap((p) =>
          (p.productVariantsData ?? []).map((v) => ({
            id: v._id,
            label: `${p.productName} — ${v.name}`,
          }))
        );
      case "CATEGORIES":
        return categories.map((c) => ({ id: c._id, label: c.name }));
      default:
        return [];
    }
  }, [scope, products, categories]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const toggle = (id: string) => {
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    onChange({ ...value, ids: next });
  };

  const changeScope = (nextScope: AppliesToScope) =>
    onChange({ scope: nextScope, ids: [] });

  const selectable = scope !== "ALL" && scope !== "BRANDS";

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm">Scope</Label>
        <Select value={scope} onValueChange={changeScope}>
          <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {APPLIES_TO_SCOPES.map((s) => (
              <SelectItem key={s} value={s} disabled={s === "BRANDS"}>
                {SCOPE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectable && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              Selected {scope.toLowerCase()} ({ids.length})
            </Label>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              placeholder={`Search ${scope.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-64 overflow-y-auto rounded-md border border-gray-300 divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground text-center">
                No items found
              </p>
            ) : (
              filtered.map((o) => (
                <label
                  key={o.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                >
                  <Checkbox
                    checked={ids.includes(o.id)}
                    onCheckedChange={() => toggle(o.id)}
                    className="border-gray-400"
                  />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
