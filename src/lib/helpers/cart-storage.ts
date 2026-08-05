/**
 * Single entry point for the two baskets the storefront keeps on the client.
 *
 * - `cart`   — the real cart, persisted in localStorage, survives reloads and
 *              new tabs, and drives the badge in the header.
 * - `buynow` — a throwaway basket for the "Buy Now" flow, kept in
 *              sessionStorage so it never mixes with the cart and disappears
 *              once the customer leaves the checkout page.
 */

export type CartSource = "cart" | "buynow";

export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

const STORAGE_KEY: Record<CartSource, string> = {
  cart: "cartItem",
  buynow: "buyNowItem",
};

const getStore = (source: CartSource): Storage | null => {
  if (typeof window === "undefined") return null;
  return source === "cart" ? window.localStorage : window.sessionStorage;
};

/** The header badge only ever reflects the real cart. */
const notifyIfCart = (source: CartSource) => {
  if (source === "cart" && typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
};

export const readLines = (source: CartSource): CartLine[] => {
  const store = getStore(source);
  if (!store) return [];

  try {
    const raw = JSON.parse(store.getItem(STORAGE_KEY[source]) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    // A corrupted entry should not take the whole page down with it.
    return [];
  }
};

export const writeLines = (source: CartSource, lines: CartLine[]) => {
  const store = getStore(source);
  if (!store) return;

  store.setItem(STORAGE_KEY[source], JSON.stringify(lines));
  notifyIfCart(source);
};

export const clearLines = (source: CartSource) => {
  const store = getStore(source);
  if (!store) return;

  store.removeItem(STORAGE_KEY[source]);
  notifyIfCart(source);
};

/**
 * How many pieces of a variant the customer already holds in the real cart.
 * "Buy Now" checks stock against this too, so the same variant can never be
 * committed twice over its available stock across the two baskets.
 */
export const getQuantityInCart = (variantId: string): number =>
  readLines("cart")
    .filter((line) => line.variantId === variantId)
    .reduce((sum, line) => sum + (line.quantity || 0), 0);
