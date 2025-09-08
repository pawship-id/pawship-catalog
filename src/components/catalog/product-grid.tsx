import ProductCard from "./product-card";
import { Product, TCurrency } from "@/lib/types/product";

interface ProductGridProps {
  products: Product[];
  currency: TCurrency;
}

export default function ProductGrid({
  products,
  currency = "IDR",
}: ProductGridProps) {
  return (
    <>
      {products.map((product, idx) => (
        <ProductCard key={idx} product={product} currency={currency} />
      ))}
    </>
  );
}
