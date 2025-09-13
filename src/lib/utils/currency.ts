import { Currency } from "@/app/product/[slug]/page";

export const currencySymbols: Record<Currency, string> = {
  IDR: "Rp",
  SGD: "S$",
  HKD: "HK$",
  USD: "$",
};

export const formatPrice = (amount: number, currency: Currency): string => {
  const symbol = currencySymbols[currency];

  if (currency === "IDR") {
    return `${symbol} ${amount.toLocaleString("id-ID")}`;
  }

  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const detectCurrency = (): Currency => {
  // In a real app, this would use geolocation or IP detection
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (timezone.includes("Singapore")) return "SGD";
  if (timezone.includes("Hong_Kong")) return "HKD";
  if (timezone.includes("Jakarta")) return "IDR";

  return "USD"; // Default
};
