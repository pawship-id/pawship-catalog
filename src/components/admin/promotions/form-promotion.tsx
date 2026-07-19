"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronsLeft, ChevronsRight, Save } from "lucide-react";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { createData, getAll, updateData } from "@/lib/apiService";
import { validatePromotionPayload } from "@/lib/helpers/promotion-validation";
import {
  PROMOTION_STATUSES,
  PROMOTION_TRIGGERS,
  type PromotionData,
  type PromotionForm,
} from "@/lib/types/promotion";
import type { ProductData } from "@/lib/types/product";
import type { CurrencyData } from "@/lib/types/currency";
import MoneyMapInput from "./money-map-input";
import AppliesToSelector from "./applies-to-selector";
import ConditionBuilder from "./condition-builder";
import RewardBuilder from "./reward-builder";
import TierBuilder from "./tier-builder";

interface CategoryLike {
  _id: string;
  name: string;
}

interface FormPromotionProps {
  initialData?: PromotionData | null;
  promotionId?: string;
}

function toDateTimeLocal(value?: string | Date): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function createEmptyForm(): PromotionForm {
  return {
    name: "",
    code: "",
    description: "",
    trigger: "CODE",
    status: "ACTIVE",
    priority: 0,
    stackable: false,
    startAt: "",
    endAt: "",
    appliesTo: { scope: "ALL", ids: [] },
    conditions: [],
    rewards: [],
    tiers: [],
    customerRules: {
      firstPurchaseOnly: false,
      newCustomerOnly: false,
      resellerOnly: false,
    },
    limits: {},
  };
}

export default function FormPromotion({
  initialData,
  promotionId,
}: FormPromotionProps) {
  const router = useRouter();
  const isEditMode = !!promotionId;

  const [form, setForm] = useState<PromotionForm>(createEmptyForm());
  const [currencies, setCurrencies] = useState<string[]>(["IDR"]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryLike[]>([]);
  const [loading, setLoading] = useState(false);

  // Tab navigation — one tab per section (mirrors the Product form)
  const tabMenu = [
    { value: "basic", label: "Basic Info" },
    { value: "applies-to", label: "Applies To" },
    { value: "conditions", label: "Conditions" },
    { value: "rewards", label: "Rewards" },
    { value: "tiers", label: "Tiers" },
    { value: "rules-limits", label: "Rules & Limits" },
  ];
  const [activeTab, setActiveTab] = useState(tabMenu[0].value);
  const currentTabIndex = tabMenu.findIndex((tab) => tab.value === activeTab);

  const handleNextTab = () => {
    if (currentTabIndex < tabMenu.length - 1) {
      setActiveTab(tabMenu[currentTabIndex + 1].value);
    }
  };
  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabMenu[currentTabIndex - 1].value);
    }
  };

  // Load reference data (currencies, products, categories)
  useEffect(() => {
    (async () => {
      try {
        const [curRes, prodRes, catRes] = await Promise.all([
          getAll<CurrencyData>("/api/admin/currencies"),
          getAll<ProductData>("/api/admin/products"),
          getAll<CategoryLike>("/api/admin/categories"),
        ]);
        const names = (curRes.data ?? []).map((c) => c.name);
        setCurrencies(Array.from(new Set(["IDR", ...names])));
        setProducts((prodRes.data ?? []).filter((p) => !p.deleted));
        setCategories(catRes.data ?? []);
      } catch (err: any) {
        showErrorAlert(undefined, err.message);
      }
    })();
  }, []);

  // Hydrate form from initialData (edit)
  useEffect(() => {
    if (!initialData) return;
    setForm({
      name: initialData.name ?? "",
      code: initialData.code ?? "",
      description: initialData.description ?? "",
      trigger: initialData.trigger ?? "CODE",
      status: initialData.status ?? "ACTIVE",
      priority: initialData.priority ?? 0,
      stackable: !!initialData.stackable,
      startAt: toDateTimeLocal(initialData.startAt),
      endAt: toDateTimeLocal(initialData.endAt),
      appliesTo: initialData.appliesTo ?? { scope: "ALL", ids: [] },
      conditions: initialData.conditions ?? [],
      rewards: initialData.rewards ?? [],
      tiers: initialData.tiers ?? [],
      customerRules: initialData.customerRules ?? {
        firstPurchaseOnly: false,
        newCustomerOnly: false,
        resellerOnly: false,
      },
      limits: initialData.limits ?? {},
    });
  }, [initialData]);

  const patch = (p: Partial<PromotionForm>) => setForm((f) => ({ ...f, ...p }));
  const patchLimits = (p: Partial<PromotionForm["limits"]>) =>
    setForm((f) => ({ ...f, limits: { ...f.limits, ...p } }));
  const patchRules = (p: Partial<PromotionForm["customerRules"]>) =>
    setForm((f) => ({ ...f, customerRules: { ...f.customerRules, ...p } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { ...form, code: form.code.trim().toUpperCase() };

    const errors = validatePromotionPayload(payload);
    if (errors.length > 0) {
      showErrorAlert("Please fix the following", errors);
      return;
    }

    setLoading(true);
    try {
      const res = isEditMode
        ? await updateData<PromotionData, PromotionForm>(
            "/api/admin/promotions",
            promotionId!,
            payload
          )
        : await createData<PromotionData, PromotionForm>(
            "/api/admin/promotions",
            payload
          );
      showSuccessAlert(undefined, res.message);
      router.push("/dashboard/promotions");
    } catch (err: any) {
      showErrorAlert(undefined, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-2 md:space-y-4"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 h-auto gap-1">
          {tabMenu.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Basic information */}
        <TabsContent value="basic" className="space-y-4 my-3">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Name, code and scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    placeholder="Enter promotion name"
                    onChange={(e) => patch({ name: e.target.value })}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700">
                    Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.code}
                    placeholder="e.g. WELCOME10"
                    onChange={(e) => patch({ code: e.target.value })}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  value={form.description}
                  placeholder="Optional description shown on the promotion detail"
                  onChange={(e) => patch({ description: e.target.value })}
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700">
                    Trigger
                  </Label>
                  <Select
                    value={form.trigger}
                    onValueChange={(trigger: any) => patch({ trigger })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMOTION_TRIGGERS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={form.status}
                    onValueChange={(status: any) => patch({ status })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMOTION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700">
                    Priority
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.priority}
                    onChange={(e) => patch({ priority: Number(e.target.value) })}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700">
                    Start at <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => patch({ startAt: e.target.value })}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700">
                    End at <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) => patch({ endAt: e.target.value })}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={form.stackable}
                  onCheckedChange={(stackable) => patch({ stackable })}
                />
                <div>
                  <Label className="text-base font-medium text-gray-700">
                    Stackable
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Can be combined with other discounts (e.g. reseller tiers)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applies to */}
        <TabsContent value="applies-to" className="space-y-4 my-3">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Applies To</CardTitle>
              <CardDescription>
                Which products this promotion targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppliesToSelector
                value={form.appliesTo}
                onChange={(appliesTo) => patch({ appliesTo })}
                products={products}
                categories={categories}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditions */}
        <TabsContent value="conditions" className="space-y-4 my-3">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
              <CardDescription>
                All conditions must be met to qualify
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConditionBuilder
                value={form.conditions}
                onChange={(conditions) => patch({ conditions })}
                currencies={currencies}
                categories={categories}
                products={products}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards */}
        <TabsContent value="rewards" className="space-y-4 my-3">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
              <CardDescription>
                What the customer gets. Ignored when tiers are defined.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RewardBuilder
                value={form.rewards}
                onChange={(rewards) => patch({ rewards })}
                currencies={currencies}
                products={products}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiers */}
        <TabsContent value="tiers" className="space-y-4 my-3">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Spend Tiers (optional)</CardTitle>
              <CardDescription>
                Reward scales with spend. When set, the highest qualifying tier
                supersedes the rewards above.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TierBuilder
                value={form.tiers}
                onChange={(tiers) => patch({ tiers })}
                currencies={currencies}
                products={products}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer rules & limits */}
        <TabsContent value="rules-limits" className="space-y-4 my-3">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Customer Rules & Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(
                  [
                    ["firstPurchaseOnly", "First purchase only"],
                    ["newCustomerOnly", "New customer only"],
                    ["resellerOnly", "Reseller only"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <Switch
                      checked={form.customerRules[key]}
                      onCheckedChange={(v) => patchRules({ [key]: v } as any)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>

              <MoneyMapInput
                label="Max discount per order (optional)"
                currencies={currencies}
                value={form.limits.maxDiscount ?? {}}
                onChange={(maxDiscount) => patchLimits({ maxDiscount })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700">
                    Max usage per customer
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.limits.maxUsagePerCustomer ?? ""}
                    onChange={(e) =>
                      patchLimits({
                        maxUsagePerCustomer:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700">
                    Total quota
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.limits.totalQuota ?? ""}
                    onChange={(e) =>
                      patchLimits({
                        totalQuota:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tab navigation + submit (mirrors the Product form) */}
      <div className="flex justify-between pt-4">
        {currentTabIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="w-30 cursor-pointer"
            onClick={handlePrevTab}
          >
            <ChevronsLeft />
            Prev
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-30 cursor-pointer">
            <Link href="/dashboard/promotions">Cancel</Link>
          </Button>
        )}

        <div className={currentTabIndex === 0 ? "ml-auto" : ""}>
          {currentTabIndex < tabMenu.length - 1 && (
            <Button
              type="button"
              className="w-36 cursor-pointer"
              onClick={handleNextTab}
            >
              Next
              <ChevronsRight />
            </Button>
          )}

          {currentTabIndex === tabMenu.length - 1 && (
            <Button
              type="submit"
              disabled={loading}
              className="w-36 cursor-pointer"
            >
              <Save />
              {loading
                ? "Loading..."
                : isEditMode
                  ? "Update Promotion"
                  : "Create Promotion"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
