"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VariantPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  variantName: string;
  currentPrices: Record<string, string>;
  currencies: {
    currency: string;
    rate: number;
  }[];
  onSave: (prices: Record<string, number>) => void;
}

export default function VariantPriceModal({
  isOpen,
  onClose,
  variantName,
  currentPrices,
  currencies,
  onSave,
}: VariantPriceModalProps) {
  const [prices, setPrices] = useState<Record<string, string>>(currentPrices);

  useEffect(() => {
    setPrices(currentPrices);
  }, [currentPrices, isOpen]);

  const handlePriceChange = (currency: string, value: string) => {
    setPrices((prev) => ({
      ...prev,
      [currency]: value === "" ? "" : value,
    }));
  };

  const handleSave = () => {
    // covert to number
    const convertedPrices: Record<string, number> = Object.fromEntries(
      Object.entries(prices).map(([currency, value]) => [
        currency,
        Number(value),
      ])
    );

    onSave(convertedPrices);
    onClose();
  };

  const handleCancel = () => {
    setPrices(currentPrices);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Prices for {variantName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currencies.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <Label htmlFor={`price-${item.currency}`}>
                Price ({item.currency})
              </Label>
              <Input
                id={`price-${item.currency}`}
                type="number"
                inputMode="decimal"
                value={prices[item.currency] ?? ""}
                onChange={(e) =>
                  handlePriceChange(item.currency, e.target.value)
                }
                placeholder="0"
                className="h-8 text-xs border-gray-300"
              />
              {/* <Input
                id={`price-${item.currency}`}
                type="text"
                inputMode="decimal"
                value={prices[item.currency] === 0 ? "" : prices[item.currency]}
                onChange={(e) =>
                  handlePriceChange(item.currency, e.target.value)
                }
                placeholder={`Enter ${item.currency} price`}
              /> */}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Prices</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
