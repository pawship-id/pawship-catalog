"use client";

import { SessionProvider } from "next-auth/react";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { PromoProvider } from "@/context/PromoContext";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CurrencyProvider>
        <PromoProvider>{children}</PromoProvider>
      </CurrencyProvider>
    </SessionProvider>
  );
}
