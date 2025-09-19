"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  // Fungsi mapping country → currency
  const getCurrencyByCountry = (countryCode: string): Currency => {
    if (countryCode === "ID") return "IDR";
    if (countryCode === "SG") return "SGD";
    return "USD";
  };

  useEffect(() => {
    // pakai Geolocation API (lat/lon → country)
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
            console.error("Failed to detect location:", err);
            setCurrency("USD");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setCurrency("USD");
          setLoading(false);
        }
      );
    } else {
      setCurrency("USD");
      setLoading(false);
    }
  }, []);

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
