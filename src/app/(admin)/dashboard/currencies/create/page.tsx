import FormCurrency from "@/components/admin/currencies/form-currency";
import React from "react";

export default function CreateCurrencyPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Add Currency
        </h1>
        <p className="text-muted-foreground text-lg">Create New Currency</p>
      </div>

      <FormCurrency />
    </div>
  );
}
