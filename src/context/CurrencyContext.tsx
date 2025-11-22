"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Currency = "USD" | "IDR" | "SGD";

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  loading: boolean;
  format: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Fungsi mapping country → currency
  const getCurrencyByCountry = (countryCode: string): Currency => {
    if (countryCode === "ID") return "IDR";
    if (countryCode === "SG") return "SGD";
    return "USD";
  };

  // Fetch reseller currency
  const fetchResellerCurrency = async () => {
    try {
      const response = await fetch("/api/public/profile");
      if (response.ok) {
        const { data } = await response.json();
        if (data.resellerCategory && data.resellerCategory.currency) {
          const resellerCurrency = data.resellerCategory.currency.toUpperCase();
          if (
            resellerCurrency === "IDR" ||
            resellerCurrency === "SGD" ||
            resellerCurrency === "USD"
          ) {
            setCurrency(resellerCurrency as Currency);
            setLoading(false);
            return true;
          }
        }
      }
      return false;
    } catch (err) {
      console.error("Failed to fetch reseller currency:", err);
      return false;
    }
  };

  // Geolocation-based currency detection
  const detectCurrencyByGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            // call reverse geocoding API
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await res.json();
            const countryCode = data.countryCode;
            setCurrency(getCurrencyByCountry(countryCode));
          } catch (err) {
            console.log("Failed to detect location:", err);
            setCurrency("USD");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.log("Geolocation error:", err);
          setCurrency("USD");
          setLoading(false);
        }
      );
    } else {
      setCurrency("USD");
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeCurrency = async () => {
      // Wait for session to load
      if (status === "loading") {
        return;
      }

      // If user is logged in as reseller, fetch currency from reseller category
      if (status === "authenticated" && session?.user?.role === "reseller") {
        const success = await fetchResellerCurrency();
        if (success) {
          return; // Currency set from reseller category
        }
      }

      // For retail users or if reseller currency fetch failed, use geolocation
      detectCurrencyByGeolocation();
    };

    initializeCurrency();
  }, [status, session]);

  const format = (amount: number) => {
    const locale =
      currency === "IDR" ? "id-ID" : currency === "SGD" ? "en-SG" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, loading, format }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
