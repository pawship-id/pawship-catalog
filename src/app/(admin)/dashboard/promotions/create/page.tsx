import FormPromotion from "@/components/admin/promotions/form-promotion";
import React from "react";

export default function CreatePromotionPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Add Promotion
        </h1>
        <p className="text-muted-foreground text-lg">Create New Promotion</p>
      </div>

      <FormPromotion />
    </div>
  );
}
