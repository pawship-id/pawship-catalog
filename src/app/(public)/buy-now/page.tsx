import CheckoutView from "@/components/cart/checkout-view";

/**
 * Checkout for a single "Buy Now" item. Same page as the cart, but the item
 * comes from a throwaway basket that is discarded as soon as the customer
 * navigates away — the real cart is never touched by this flow.
 */
export default function BuyNowPage() {
  return <CheckoutView source="buynow" />;
}
