"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TCurrency } from "@/lib/types/product";

type CurrencyContextType = {
  currency: TCurrency;
  setCurrency: (c: TCurrency) => void;
  loading: boolean;
  format: (amount: number) => string;
  userCountry: string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrency] = useState<TCurrency>("USD");
  const [userCountry, setUserCountry] = useState<string>("United States");
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Fungsi mapping country → currency
  const getCurrencyByCountry = (countryCode: string): TCurrency => {
    if (countryCode === "ID") return "IDR";
    if (countryCode === "SG") return "SGD";
    if (countryCode === "HK") return "HKD";
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
            resellerCurrency === "USD" ||
            resellerCurrency === "HKD"
          ) {
            setCurrency(resellerCurrency as TCurrency);

            // Detect user country from geolocation
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await res.json();
                    setUserCountry(data.countryName);
                  } catch (err) {
                    console.log("Failed to detect location:", err);
                    setUserCountry("United States");
                  }
                },
                (err) => {
                  console.log("Geolocation error:", err);
                  setUserCountry("United States");
                }
              );
            } else {
              setUserCountry("United States");
            }

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
            setUserCountry(data.countryName); // Save country code
            setCurrency(getCurrencyByCountry(countryCode));
          } catch (err) {
            console.log("Failed to detect location:", err);
            setUserCountry("United States");
            setCurrency("USD");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.log("Geolocation error:", err);
          setUserCountry("United States");
          setCurrency("USD");
          setLoading(false);
        }
      );
    } else {
      setUserCountry("United States");
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

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, loading, format, userCountry }}
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
