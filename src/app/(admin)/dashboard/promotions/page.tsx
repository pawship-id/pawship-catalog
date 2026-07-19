"use client";

import React, { useState } from "react";
import TablePromotion from "@/components/admin/promotions/table-promotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function PromotionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Promotion Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage promotion codes, conditions, rewards and tiers
        </p>
      </div>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <Button asChild>
            <Link href="/dashboard/promotions/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Promotion
            </Link>
          </Button>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code or name..."
                className="pl-10 border-1 border-border focus:border-primary w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <TablePromotion searchQuery={searchQuery} />
    </div>
  );
}
