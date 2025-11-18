"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivePromo } from "@/lib/helpers/promo-helper";

interface PromoContextType {
  activePromos: ActivePromo[];
  loading: boolean;
  refreshPromos: () => Promise<void>;
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

export function PromoProvider({ children }: { children: React.ReactNode }) {
  const [activePromos, setActivePromos] = useState<ActivePromo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivePromos = async () => {
    try {
      const response = await fetch("/api/promos/active");
      const result = await response.json();

      if (result.success) {
        setActivePromos(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching active promos:", error);
      setActivePromos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePromos();

    // Refresh every 5 minutes to keep promos up-to-date
    // const interval = setInterval(fetchActivePromos, 5 * 60 * 1000);

    // return () => clearInterval(interval);
  }, []);

  return (
    <PromoContext.Provider
      value={{ activePromos, loading, refreshPromos: fetchActivePromos }}
    >
      {children}
    </PromoContext.Provider>
  );
}

export function usePromo() {
  const context = useContext(PromoContext);
  if (context === undefined) {
    throw new Error("usePromo must be used within a PromoProvider");
  }
  return context;
}
