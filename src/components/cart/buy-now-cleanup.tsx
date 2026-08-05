"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { clearLines } from "@/lib/helpers/cart-storage";

/**
 * The Buy Now basket belongs to /buy-now and nowhere else: the moment the
 * customer is on any other route, throw it away. Tying this to the pathname
 * rather than to the checkout page's unmount means reloading /buy-now keeps the
 * item (nobody wants an empty screen after an accidental refresh) and React's
 * StrictMode remount in development cannot wipe it either.
 */
export default function BuyNowCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/buy-now") {
      clearLines("buynow");
    }
  }, [pathname]);

  return null;
}
