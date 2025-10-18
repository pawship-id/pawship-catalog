import FormResellerCategory from "@/components/admin/reseller-category/form-reseller-category";
import React from "react";

export default function CreateResellerCategoryPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Add Reseller Category
        </h1>
        <p className="text-muted-foreground text-lg">
          Create New Reseller Category
        </p>
      </div>

      <FormResellerCategory />
    </div>
  );
}
