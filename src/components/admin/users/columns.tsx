"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";

export type TColumm = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  deleted: boolean;
};

export const columns: ColumnDef<TColumm>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "deleted",
    header: "Status",
    cell: ({ row }) => {
      const isDeleted = row.getValue("deleted") as boolean;
      return (
        <Badge variant={isDeleted ? "destructive" : "default"}>
          {isDeleted ? "Non Active" : "Active"}
        </Badge>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const brand = row.original;

      return (
        <div className="space-x-4 inline-flex">
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/dashboard/brands/edit/${brand.id}`}>
              <Edit className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];
