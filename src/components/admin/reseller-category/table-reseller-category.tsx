import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function TableResellerCategory() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Reseller Name</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Reseller Indonesia</TableCell>
            <TableCell>
              <Badge variant="outline">IDR</Badge>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  true
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {true ? "Active" : "Non Active"}
              </span>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                {/* <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/dashboard/categories/edit/1`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0"></DropdownMenuItem>
                </DropdownMenuContent> */}
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
