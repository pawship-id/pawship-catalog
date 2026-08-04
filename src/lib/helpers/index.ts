// helper cek role
export function isAdmin(role: string) {
  return role === "admin";
}
export function isReseller(role: string) {
  return role === "reseller";
}
export function isRetail(role: string) {
  return role === "retail";
}

/*
  generate slug
  text -> the data that will be converted into a url
  id -> the ID data from the database
*/
export function generateSlug(text: string) {
  text = text.replace(/[^a-zA-Z0-9]/g, "-");

  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString().slice(-2);
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const randomChars = Math.random().toString(36).substring(2, 4);

  const id = `${randomChars}${day}${month}${year}${seconds}`;

  return text.toLowerCase().split(" ").join("-") + "-" + id;
}

export const currencyFormat = (amount: number, currency: string) => {
  const locale =
    currency === "IDR"
      ? "id-ID"
      : currency === "SGD"
        ? "en-SG"
        : currency === "HKD"
          ? "zh-HK"
          : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * What the customer actually pays, in the ORDER's own currency: items after
 * their per-line discount, plus shipping, minus the shipping discount, minus
 * the promotion benefit.
 *
 * Same figure `calculateOrderRevenue` converts into `netRevenue`, only left in
 * the order currency. Every screen showing an order total must call this — the
 * formula used to be copied into each one, and the copy on the customer order
 * list had silently fallen a term behind (it never subtracted the promotion).
 *
 * Lives here, not in currency-helper.ts: that module imports the Currency model
 * and would drag mongoose into every "use client" screen that shows a total.
 */
export function calculateOrderPayable(order: {
  totalAmount?: number;
  shippingCost?: number;
  discountShipping?: number;
  promotionDiscount?: number;
}): number {
  return (
    (order?.totalAmount || 0) +
    (order?.shippingCost || 0) -
    (order?.discountShipping || 0) -
    (order?.promotionDiscount || 0)
  );
}
