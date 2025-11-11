import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import TableCategory from "@/components/admin/categories/table-category";
import Link from "next/link";
import React from "react";

export default function CategoryPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Category Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your product categories and subcategories
        </p>
      </div>

      <div className="mb-4">
        <Button asChild>
          <Link href="/dashboard/categories/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      <TableCategory />
    </div>
  );
}
