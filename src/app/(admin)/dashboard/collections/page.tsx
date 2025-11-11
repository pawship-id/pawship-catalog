import TableCollection from "@/components/admin/collections/table-collection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function CollectionPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Collection Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your product collections and display rules
        </p>
      </div>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <Button asChild>
            <Link href="/dashboard/collections/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Collection
            </Link>
          </Button>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collection..."
                className="pl-10 border-1 border-border focus:border-primary w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <TableCollection />
    </div>
  );
}
