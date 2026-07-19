"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ticket, ChevronDown, ChevronUp, Check } from "lucide-react";
import { currencyFormat } from "@/lib/helpers";
import { showErrorAlert } from "@/lib/helpers/sweetalert2";
import {
  summarizeBenefits,
  summarizeConditions,
} from "@/lib/helpers/promotion-engine";
import type {
  EvaluationCart,
  EvaluationCustomer,
  PromotionData,
  PromotionEvaluationResult,
  PromotionEvaluationSuccess,
} from "@/lib/types/promotion";

type AvailablePromotion = PromotionData & {
  evaluation?: PromotionEvaluationResult;
};

interface PromotionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: EvaluationCart;
  customer: EvaluationCustomer;
  currency: string;
  appliedCodes: string[];
  onApply: (result: PromotionEvaluationSuccess) => void;
}

export default function PromotionSelectorModal({
  isOpen,
  onClose,
  cart,
  customer,
  currency,
  appliedCodes,
  onApply,
}: PromotionSelectorModalProps) {
  const [promotions, setPromotions] = useState<AvailablePromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/promotions/available", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart, customer, currency }),
        });
        const json = await res.json();
        setPromotions(json.data || []);
      } catch {
        showErrorAlert(undefined, "Failed to load promotions");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // The code input doubles as the search: typing a code filters the cards.
  const filtered = promotions.filter(
    (p) =>
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Clicking a card applies it directly (only when it is valid & not applied).
  const handleSelect = (promo: AvailablePromotion) => {
    const evaluation = promo.evaluation;
    if (!evaluation?.valid) return;
    if (appliedCodes.includes(promo.code)) return;
    onApply(evaluation);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply Promotion</DialogTitle>
        </DialogHeader>

        {/* Code input — also acts as the search for the cards below */}
        <div className="relative">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            className="pl-10 uppercase border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            placeholder="Enter promotion code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          Type a code to find it, then click the card to apply.
        </p>

        {/* Cards */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading promotions...
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {search
                ? `No promotion found for "${search}".`
                : "No promotions available for this order."}
            </p>
          ) : (
            filtered.map((promo) => {
              const evaluation = promo.evaluation;
              const isValid = evaluation?.valid === true;
              const isApplied = appliedCodes.includes(promo.code);
              const clickable = isValid && !isApplied;
              const reason =
                evaluation && !evaluation.valid ? evaluation.reason : "";
              const isOpen2 = expanded === promo._id;

              return (
                <div
                  key={promo._id}
                  onClick={() => handleSelect(promo)}
                  className={`rounded-lg border p-4 transition-colors ${
                    clickable
                      ? "bg-white border-gray-200 cursor-pointer hover:border-primary hover:shadow-sm"
                      : isApplied
                        ? "bg-white border-primary/50"
                        : "bg-gray-50 border-gray-200 opacity-80 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{promo.name}</span>
                        <Badge variant="outline" className="font-mono">
                          {promo.code}
                        </Badge>
                        <Badge>
                          {promo.trigger === "CODE" ? "Voucher" : "Promotion"}
                        </Badge>
                        {isApplied && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                            <Check className="h-3 w-3" /> Applied
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-primary font-medium">
                        {summarizeBenefits(promo, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {summarizeConditions(promo, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Valid until {new Date(promo.endAt).toLocaleDateString()}
                      </p>
                      {isValid && evaluation?.valid && (
                        <p className="text-xs text-green-700">
                          Discount:{" "}
                          {currencyFormat(
                            evaluation.discount + evaluation.shippingDiscount,
                            currency
                          )}
                        </p>
                      )}
                      {!isValid && reason && (
                        <p className="text-xs text-red-600 font-medium">
                          {reason}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(isOpen2 ? null : promo._id);
                      }}
                      className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground shrink-0"
                    >
                      View Details
                      {isOpen2 ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {isOpen2 && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 pt-3 border-t text-sm space-y-1 text-muted-foreground cursor-default"
                    >
                      {promo.description && <p>{promo.description}</p>}
                      <p>
                        Applies to:{" "}
                        {promo.appliesTo?.scope === "ALL"
                          ? "All products"
                          : `${promo.appliesTo?.scope} (${
                              promo.appliesTo?.ids?.length ?? 0
                            })`}
                      </p>
                      <p>Stackable: {promo.stackable ? "Yes" : "No"}</p>
                      <p>Priority: {promo.priority}</p>
                      {promo.limits?.totalQuota != null && (
                        <p>
                          Quota: {promo.usedCount ?? 0} /{" "}
                          {promo.limits.totalQuota}
                        </p>
                      )}
                      {promo.limits?.maxDiscount && (
                        <p>
                          Max discount:{" "}
                          {Object.entries(promo.limits.maxDiscount)
                            .map(([c, v]) => currencyFormat(Number(v), c))
                            .join(" · ")}
                        </p>
                      )}
                      {(promo.tiers ?? []).length > 0 && (
                        <p>{promo.tiers.length} spend tier(s)</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
