"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";
import ProductCard from "@/components/product-card";
import { ProductData } from "@/lib/types/product";
import { Heart } from "lucide-react";
import LoadingPage from "@/components/loading";

interface FavoriteData {
  _id: string;
  userId: string;
  productId: ProductData;
  createdAt: string;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { refreshFavorites } = useFavorites();
  const [favorites, setFavorites] = useState<FavoriteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/favorites");
      const data = await response.json();

      if (data.success) {
        setFavorites(data.data);
        refreshFavorites();
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <LoadingPage />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main className="container mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
            Wishlist Product
          </h1>
          <p className="text-medium lg:text-lg text-muted-foreground">
            Your personal list of premium pet products you love.
          </p>
        </div>

        {/* Product Count */}
        {favorites.length > 0 && (
          <div className="bg-white px-4 py-2 mb-6 rounded-lg border border-gray-200 w-fit">
            <span className="text-sm text-gray-600">
              You have{" "}
              <span className="font-semibold text-gray-800">
                {favorites.length}
              </span>{" "}
              product{favorites.length !== 1 ? "s" : ""} in your wishlist
            </span>
          </div>
        )}

        {/* Product Grid or Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Start adding products to your wishlist by clicking the heart icon
            </p>
            <button
              onClick={() => router.push("/catalog")}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites.map((favorite) => (
              <ProductCard
                key={favorite._id}
                product={favorite.productId}
                onFavoriteToggle={fetchFavorites}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
