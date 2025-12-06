"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface FavoritesContextType {
  favorites: Set<string>;
  toggleFavorite: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { data: session } = useSession();

  const fetchFavorites = async () => {
    if (!session?.user?.id) {
      setFavorites(new Set());
      return;
    }

    try {
      const response = await fetch("/api/favorites");
      const data = await response.json();

      if (data.success) {
        const favoriteIds = new Set<string>(
          data.data.map((fav: any) => {
            const id = fav.productId._id || fav.productId;
            return typeof id === "string" ? id : String(id);
          })
        );
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [session]);

  const toggleFavorite = async (productId: string): Promise<boolean> => {
    if (!session?.user?.id) {
      return false;
    }

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.success) {
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          if (data.isFavorite) {
            newFavorites.add(productId);
          } else {
            newFavorites.delete(productId);
          }
          return newFavorites;
        });
        return data.isFavorite;
      }
      return false;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.has(productId);
  };

  const refreshFavorites = async () => {
    await fetchFavorites();
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite, refreshFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
