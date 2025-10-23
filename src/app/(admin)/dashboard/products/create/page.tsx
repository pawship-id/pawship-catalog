import FormProduct from "@/components/admin/products/form-product";
import React from "react";

export default function CreateProductPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Add Product
        </h1>
        <p className="text-muted-foreground text-lg">Edit Product Data</p>
      </div>
      <FormProduct />
    </div>
  );
}
