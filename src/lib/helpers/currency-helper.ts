/**
 * Currency conversion rates to IDR
 */
export const currencyRates = {
  IDR: 1,
  USD: 16000,
  SGD: 11000,
  HKD: 2000,
} as const;

export type CurrencyCode = keyof typeof currencyRates;

/**
 * Convert amount from any currency to IDR
 * @param amount - The amount to convert
 * @param currency - The currency code (IDR, USD, SGD, HKD)
 * @returns Amount in IDR
 */
export function convertToIDR(amount: number, currency: string): number {
  const upperCurrency = currency.toUpperCase() as CurrencyCode;
  const rate = currencyRates[upperCurrency];

  if (!rate) {
    console.warn(`Unknown currency: ${currency}, defaulting to IDR`);
    return amount;
  }

  return Math.round(amount * rate);
}

/**
 * Calculate revenue in IDR for an order
 * @param totalAmount - The total amount of the order
 * @param shippingCost - The shipping cost
 * @param currency - The currency code
 * @returns Revenue in IDR (totalAmount + shippingCost converted to IDR)
 */
export function calculateRevenueInIDR(
  totalAmount: number,
  shippingCost: number,
  currency: string
): number {
  const total = totalAmount + shippingCost;
  return convertToIDR(total, currency);
}
