import ProductCard from "./product-card";
import { Product, TCurrency } from "@/lib/types/product";

interface ProductGridProps {
  products: Product[];
  currency: TCurrency;
}

export function ProductGrid({ products, currency = "IDR" }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🐾</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No products found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3  gap-6">
      {products.map((product, idx) => (
        <ProductCard key={idx} product={product} currency={currency} />
      ))}
    </div>
  );
}
