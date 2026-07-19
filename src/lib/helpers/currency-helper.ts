import Currency from "@/lib/models/Currency";
import dbConnect from "@/lib/mongodb";

/**
 * Rupiah is the base currency, so its rate is always 1.
 */
export const BASE_CURRENCY = "IDR";

/**
 * Number of decimal places a currency uses (IDR/JPY → 0, USD/SGD/HKD → 2).
 * Falls back to 2 for anything Intl does not recognise.
 */
export function currencyDecimals(currency: string): number {
  try {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: String(currency || "").toUpperCase(),
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

/**
 * Round a monetary amount to the precision the currency is actually displayed
 * with, so the value stored in the database matches what the UI renders.
 *
 * The intermediate `toFixed(6)` clears binary floating-point noise such as
 * `3.8949999999999996` or `1450.8000000000002` before the final rounding.
 */
export function roundMoney(amount: number, currency: string): number {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return amount;

  const factor = 10 ** currencyDecimals(currency);
  return Math.round(Number((amount * factor).toFixed(6))) / factor;
}

/**
 * Round every entry of a price map (`{ IDR: 100000, USD: 5.6, ... }`) to the
 * precision of its own currency. Non-numeric entries are left untouched.
 */
export function roundPriceMap(
  priceMap: Record<string, number> | null | undefined
): Record<string, number> | null | undefined {
  if (!priceMap || typeof priceMap !== "object") return priceMap;

  const rounded: Record<string, number> = {};
  for (const [code, value] of Object.entries(priceMap)) {
    rounded[code] =
      typeof value === "number" && Number.isFinite(value)
        ? roundMoney(value, code)
        : value;
  }
  return rounded;
}

/**
 * Normalise the monetary fields of an order to the currency's precision so the
 * value stored in the database is exactly what the UI displays. Rounds each
 * item's `subTotal` and price maps, then derives `totalAmount` from the sum of
 * the rounded subtotals (keeping the `totalAmount === Σ subTotal` invariant the
 * order tables rely on).
 *
 * Returns new objects; the input is not mutated.
 */
export function normalizeOrderMoney<
  T extends {
    subTotal: number;
    originalPrice?: any;
    discountedPrice?: any;
  }
>(
  orderDetails: T[],
  currency: string
): { orderDetails: T[]; totalAmount: number } {
  const normalized = (orderDetails || []).map((item) => ({
    ...item,
    subTotal: roundMoney(item.subTotal, currency),
    originalPrice: roundPriceMap(item.originalPrice),
    discountedPrice: roundPriceMap(item.discountedPrice),
  })) as T[];

  const totalAmount = roundMoney(
    normalized.reduce((sum, item) => sum + (Number(item.subTotal) || 0), 0),
    currency
  );

  return { orderDetails: normalized, totalAmount };
}

/**
 * Get the current rupiah rate of a currency from the database
 * (managed in Dashboard > Currencies)
 * @param currency - The currency code (e.g. USD, SGD, HKD)
 * @returns Value of 1 unit of the currency in rupiah
 * @throws When the currency has not been configured by the admin
 */
export async function getRateToIDR(currency: string): Promise<number> {
  const code = String(currency || "")
    .trim()
    .toUpperCase();

  if (!code) {
    throw new Error("Currency is required to convert an amount to IDR");
  }

  await dbConnect();

  const currencyData: any = await Currency.findOne({ name: code })
    .select("baseRupiah")
    .lean();

  if (currencyData) {
    return currencyData.baseRupiah;
  }

  if (code === BASE_CURRENCY) {
    return 1;
  }

  throw new Error(
    `Currency ${code} is not configured. Please add it in Dashboard > Currencies.`
  );
}

/**
 * Resolve which rupiah rate an order should be valued with.
 *
 * An order snapshots `baseRupiah` when it is created, so changing a rate later
 * never moves the revenue of orders that were already placed. Orders created
 * before the snapshot field existed fall back to the current rate.
 *
 * @param currency - The currency code of the order
 * @param snapshot - The baseRupiah already stored on the order, if any
 * @returns The rupiah rate to value the order with
 */
export async function resolveBaseRupiah(
  currency: string,
  snapshot?: number | null
): Promise<number> {
  if (typeof snapshot === "number" && Number.isFinite(snapshot) && snapshot > 0) {
    return snapshot;
  }

  return getRateToIDR(currency);
}

export interface OrderRevenue {
  grossRevenue: number; // before every discount (product discount + shipping discount)
  netRevenue: number; // what the customer actually pays
}

export interface OrderRevenueInput {
  orderDetails: Array<{
    quantity: number;
    subTotal: number;
    originalPrice?: any; // Record<currency, number>, price before the product discount
  }>;
  currency: string;
  totalAmount: number; // sum of subTotal, i.e. already after the product discount
  shippingCost: number;
  discountShipping: number;
  baseRupiah: number;
  promotionDiscount?: number; // total promotion benefit (product + shipping), order currency
}

/**
 * Calculate the revenue of an order in IDR from a known rupiah rate.
 *
 * Takes a single object rather than positional arguments: every call site must
 * go through this function, and a forgotten `discountShipping` is exactly the
 * bug this replaces.
 *
 * - `grossRevenue` is built from each item's `originalPrice`, so it is the value
 *   of the order before the product discount AND before the shipping discount.
 * - `netRevenue` is built from `totalAmount` (already discounted per item) minus
 *   the shipping discount, so it is what the customer actually pays.
 *
 * @returns Gross and net revenue in IDR
 */
export function calculateOrderRevenue({
  orderDetails,
  currency,
  totalAmount,
  shippingCost,
  discountShipping,
  baseRupiah,
  promotionDiscount = 0,
}: OrderRevenueInput): OrderRevenue {
  const code = String(currency || "")
    .trim()
    .toUpperCase();

  const grossAmount = (orderDetails || []).reduce((sum, item) => {
    const unitPrice = item?.originalPrice?.[code];

    // Fall back to the item's own subTotal when the original price for this
    // currency is unavailable — a missing price must not turn revenue into NaN
    const hasOriginalPrice =
      typeof unitPrice === "number" && Number.isFinite(unitPrice);

    return (
      sum +
      (hasOriginalPrice
        ? unitPrice * (item.quantity || 0)
        : Number(item?.subTotal) || 0)
    );
  }, 0);

  const gross = grossAmount + (shippingCost || 0);
  const net =
    (totalAmount || 0) +
    (shippingCost || 0) -
    (discountShipping || 0) -
    (promotionDiscount || 0);

  return {
    grossRevenue: Math.round(gross * baseRupiah),
    netRevenue: Math.round(net * baseRupiah),
  };
}
