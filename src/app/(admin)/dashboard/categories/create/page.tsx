import FormCategory from "@/components/admin/categories/form-category";
import React from "react";

export default function CreateCategoryPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Add Category
        </h1>
        <p className="text-muted-foreground text-lg">Create New Category</p>
      </div>

      <FormCategory />
    </div>
  );
}
