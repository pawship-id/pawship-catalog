import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/admin/users/columns";
import { getUsers } from "@/lib/data/admin/user";

export default async function UserPage() {
  const data = await getUsers();

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Users Management
        </h1>
        <p className="text-muted-foreground">View and manage all users</p>
      </div>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10 border-1 border-border focus:border-primary w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
