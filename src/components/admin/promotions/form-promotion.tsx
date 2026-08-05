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
  PROMOTION_CHANNELS,
  PROMOTION_STATUSES,
  PROMOTION_TRIGGERS,
  type PromotionChannel,
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

const CHANNEL_LABELS: Record<PromotionChannel, string> = {
  WEB: "Web",
  WHATSAPP: "WhatsApp",
};

/**
 * Match a stored enum value against the options actually offered.
 *
 * Case and surrounding whitespace are normalised first, so a legacy
 * `"automatic"` is recognised as the same trigger as `"AUTOMATIC"`. Anything
 * that still does not match returns `null` rather than a fallback: substituting
 * a plausible default looks correct on screen and then gets written back on the
 * next save, silently retiring an automatic promotion. The caller shows the
 * stored value instead and asks the admin to choose.
 */
function normalizeOption<T extends string>(
  options: readonly T[],
  value: unknown
): T | null {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  return options.find((option) => option === normalized) ?? null;
}

/**
 * Names the value the document actually holds when it is not one of the options.
 * Without it the Select is just an empty box, which reads as "the data failed to
 * load" — the exact confusion that made this bug hard to place.
 */
function StoredValueWarning({ value }: { value?: unknown }) {
  const shown = String(value ?? "").trim() || "—";
  return (
    <p className="text-xs text-red-600">
      Stored value <span className="font-semibold">{shown}</span> is not one of
      the options above. Pick one to replace it — leaving it alone keeps the
      stored value untouched.
    </p>
  );
}

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

// A datetime-local value ("2026-07-30T21:05") carries no timezone, so parsing it
// on the server resolves it against the SERVER's timezone (UTC in production)
// instead of the admin's. Pin it to an absolute instant here, in the browser.
function toIsoInstant(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
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
    channels: [...PROMOTION_CHANNELS],
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

/**
 * Build the form state from a promotion document.
 *
 * Pure, and fed to `useState`'s initialiser rather than applied later from an
 * effect. Radix registers its `<SelectItem>`s on the first render (when closed,
 * its content lives in a DocumentFragment created in a layout effect), and the
 * trigger's label is portalled out of the item that is selected at that moment.
 * A value that only arrives a render later therefore never reaches the label:
 * the box stays blank with no error, and the only values that appear to work are
 * the ones that happen to equal the defaults. Seeding the real value up front is
 * what keeps every Select filled — in `next dev` and in a production build alike
 * (Strict Mode's double mount hid this in dev by re-registering the items).
 */
function formFromPromotion(initialData?: PromotionData | null): PromotionForm {
  const empty = createEmptyForm();
  if (!initialData) return empty;

  return {
    ...empty,
    name: initialData.name ?? "",
    code: initialData.code ?? "",
    description: initialData.description ?? "",
    // `?? ""` keeps an unrecognised stored value out of the form without
    // pretending it was something else — see `normalizeOption`.
    trigger: normalizeOption(PROMOTION_TRIGGERS, initialData.trigger) ?? "",
    status: normalizeOption(PROMOTION_STATUSES, initialData.status) ?? "",
    priority: initialData.priority ?? 0,
    stackable: !!initialData.stackable,
    // Promotions saved before channels existed have none — show them as
    // available everywhere, which is exactly how the engine treats them.
    // Unknown entries are dropped: a channel with no checkbox would silently
    // survive every save.
    channels: (() => {
      const known = (initialData.channels ?? []).filter((c) =>
        PROMOTION_CHANNELS.includes(c)
      );
      return known.length ? known : [...PROMOTION_CHANNELS];
    })(),
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
  };
}

export default function FormPromotion({
  initialData,
  promotionId,
}: FormPromotionProps) {
  const router = useRouter();
  const isEditMode = !!promotionId;

  // Seeded from `initialData` on the very first render, never patched in later —
  // see `formFromPromotion`. The edit page only mounts this component once the
  // fetch has resolved, so there is nothing to wait for.
  const [form, setForm] = useState<PromotionForm>(() =>
    formFromPromotion(initialData)
  );
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

  const patch = (p: Partial<PromotionForm>) => setForm((f) => ({ ...f, ...p }));

  // Turning a channel off at the promotion level also drops it from every tier,
  // otherwise a tier would be left pointing at a channel the promotion is no
  // longer on and the payload would fail validation on save.
  const toggleChannel = (channel: PromotionChannel, checked: boolean) =>
    setForm((f) => {
      const channels = checked
        ? PROMOTION_CHANNELS.filter(
            (c) => c === channel || f.channels.includes(c)
          )
        : f.channels.filter((c) => c !== channel);
      return {
        ...f,
        channels,
        tiers: f.tiers.map((t) => ({
          ...t,
          channels: (t.channels ?? []).filter((c) => channels.includes(c)),
        })),
      };
    });

  const patchLimits = (p: Partial<PromotionForm["limits"]>) =>
    setForm((f) => ({ ...f, limits: { ...f.limits, ...p } }));
  const patchRules = (p: Partial<PromotionForm["customerRules"]>) =>
    setForm((f) => ({ ...f, customerRules: { ...f.customerRules, ...p } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<PromotionForm> = {
      ...form,
      code: form.code.trim().toUpperCase(),
      startAt: toIsoInstant(form.startAt),
      endAt: toIsoInstant(form.endAt),
    };

    // An empty enum means the stored value is not one we offer and the admin has
    // not picked a replacement. Dropping the key leaves the document's own value
    // alone; sending `""` would fail the Mongoose enum validator, and sending a
    // guessed default would quietly rewrite it.
    if (!payload.trigger) delete payload.trigger;
    if (!payload.status) delete payload.status;

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
        : await createData<PromotionData, Partial<PromotionForm>>(
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
                    // Never coerced. An empty value means the stored one is not
                    // an option we offer; the placeholder plus the warning below
                    // say so, where a plausible default would look correct and
                    // then be written back on save.
                    value={form.trigger}
                    onValueChange={(trigger: any) => patch({ trigger })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full">
                      {/* Explicit children so the label is rendered by
                          SelectValue itself instead of being portalled out of
                          whichever item Radix had registered at first render. */}
                      <SelectValue placeholder="Select trigger">
                        {form.trigger}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PROMOTION_TRIGGERS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.trigger ? (
                    <p className="text-xs text-muted-foreground">
                      {form.trigger === "AUTOMATIC"
                        ? "Applies on its own once the cart qualifies. The customer never types anything, so the code below is only an internal label."
                        : "The customer redeems this by entering the code below."}
                    </p>
                  ) : (
                    <StoredValueWarning value={initialData?.trigger} />
                  )}
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
                      <SelectValue placeholder="Select status">
                        {form.status}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PROMOTION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!form.status && (
                    <StoredValueWarning value={initialData?.status} />
                  )}
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

              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-700">
                  Channels <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-5">
                  {PROMOTION_CHANNELS.map((channel) => (
                    <label
                      key={channel}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={form.channels.includes(channel)}
                        onChange={(e) => toggleChannel(channel, e.target.checked)}
                      />
                      {CHANNEL_LABELS[channel]}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Where this code can be redeemed. WhatsApp covers orders an
                  admin keys in manually. Individual tiers can narrow this
                  further.
                </p>
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
              <CardTitle>Tiers (optional)</CardTitle>
              <CardDescription>
                Reward scales with spend or quantity. When set, the highest
                qualifying tier supersedes the rewards above.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TierBuilder
                promotionChannels={form.channels}
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
