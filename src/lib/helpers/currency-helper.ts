import Currency from "@/lib/models/Currency";
import dbConnect from "@/lib/mongodb";

/**
 * Rupiah is the base currency, so its rate is always 1.
 */
export const BASE_CURRENCY = "IDR";

/**
 * Get the rupiah rate of a currency from the database
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
 * Convert amount from any currency to IDR
 * @param amount - The amount to convert
 * @param currency - The currency code (IDR, USD, SGD, HKD, ...)
 * @returns Amount in IDR
 */
export async function convertToIDR(
  amount: number,
  currency: string
): Promise<number> {
  const rate = await getRateToIDR(currency);

  return Math.round(amount * rate);
}

/**
 * Calculate revenue in IDR for an order
 * @param totalAmount - The total amount of the order
 * @param shippingCost - The shipping cost
 * @param currency - The currency code
 * @returns Revenue in IDR (totalAmount + shippingCost converted to IDR)
 */
export async function calculateRevenueInIDR(
  totalAmount: number,
  shippingCost: number,
  currency: string
): Promise<number> {
  const total = totalAmount + shippingCost;

  return convertToIDR(total, currency);
}
