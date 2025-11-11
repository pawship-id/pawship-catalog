import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import TableUser from "@/components/admin/users/table-user";

export default function UserPage() {
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
        <Button asChild>
          <Link href="/dashboard/users/create">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Link>
        </Button>
      </div>

      <TableUser />
    </div>
  );
}
