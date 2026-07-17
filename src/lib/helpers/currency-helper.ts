import Currency from "@/lib/models/Currency";
import dbConnect from "@/lib/mongodb";

/**
 * Rupiah is the base currency, so its rate is always 1.
 */
export const BASE_CURRENCY = "IDR";

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

/**
 * Calculate revenue in IDR from a known rupiah rate
 * @param totalAmount - The total amount of the order
 * @param shippingCost - The shipping cost
 * @param baseRupiah - The rupiah rate the order is valued with
 * @returns Revenue in IDR
 */
export function calculateRevenueFromBaseRupiah(
  totalAmount: number,
  shippingCost: number,
  baseRupiah: number
): number {
  return Math.round((totalAmount + shippingCost) * baseRupiah);
}
