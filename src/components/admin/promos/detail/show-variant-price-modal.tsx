"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PromoVariant } from "@/lib/types/promo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currencyFormat } from "@/lib/helpers";

interface ShowVariantPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: PromoVariant;
  currencies: string[];
}

export default function ShowVariantPriceModal({
  isOpen,
  onClose,
  variant,
  currencies,
}: ShowVariantPriceModalProps) {
  const [localVariant, setLocalVariant] = useState<PromoVariant>(variant);

  useEffect(() => {
    if (isOpen) {
      setLocalVariant(variant);
    }
  }, [isOpen, variant]);

  const handleCancel = () => {
    setLocalVariant(variant); // Reset to original
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              Price List Product for {localVariant.variantName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Product variant prices based on currency
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 my-2">
          <div className="space-y-6">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="font-bold">
                    <TableHead>Currency</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Discounted Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((currency) => (
                    <TableRow key={currency}>
                      <TableCell>{currency}</TableCell>
                      <TableCell>
                        {currencyFormat(
                          localVariant.originalPrice[currency] || 0,
                          currency
                        )}
                      </TableCell>
                      <TableCell>
                        {localVariant.discountPercentage[currency] === 0
                          ? 0
                          : localVariant.discountPercentage[currency]}{" "}
                        %
                      </TableCell>
                      <TableCell>
                        {currencyFormat(
                          localVariant.discountedPrice[currency] === 0
                            ? 0
                            : localVariant.discountedPrice[currency],
                          currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
