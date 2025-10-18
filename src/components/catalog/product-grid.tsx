import { Product } from "@/lib/types/product";
import ProductCard from "../product-card";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <>
      {products.map((product, idx) => (
        <ProductCard key={idx} product={product} />
      ))}
    </>
  );
}
