"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import TableUser from "@/components/admin/users/table-user";

export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Users Management
        </h1>
        <p className="text-muted-foreground text-lg">
          View and manage all users
        </p>
      </div>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <Button asChild>
            <Link href="/dashboard/users/create">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </Button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
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

      <TableUser searchQuery={searchQuery} />
    </div>
  );
}
