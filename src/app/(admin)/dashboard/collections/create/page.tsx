import React from "react";
import FormCollection from "@/components/admin/collections/form-collection";

export default function CreateCollectionPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Create Collection
        </h1>
        <p className="text-muted-foreground text-lg">
          Add a new collection to organize your products
        </p>
      </div>

      <FormCollection />
    </div>
  );
}
