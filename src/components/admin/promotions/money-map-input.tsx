"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MoneyMap } from "@/lib/types/promotion";

interface MoneyMapInputProps {
  label?: string;
  currencies: string[];
  value: MoneyMap;
  onChange: (value: MoneyMap) => void;
}

/**
 * Per-currency amount editor. Every monetary field on a promotion (thresholds,
 * fixed/max discounts, tier thresholds) is a MoneyMap and is edited with this.
 */
export default function MoneyMapInput({
  label,
  currencies,
  value,
  onChange,
}: MoneyMapInputProps) {
  const handleChange = (code: string, raw: string) => {
    const next = { ...(value || {}) };
    if (raw === "") {
      delete next[code];
    } else {
      next[code] = Number(raw);
    }
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {currencies.map((code) => (
          <div key={code} className="space-y-1">
            <span className="text-xs text-muted-foreground">{code}</span>
            <Input
              type="number"
              min={0}
              step="any"
              placeholder="0"
              value={value?.[code] ?? ""}
              onChange={(e) => handleChange(code, e.target.value)}
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
