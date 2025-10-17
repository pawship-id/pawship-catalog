"use client";
import React, { useEffect, useState } from "react";
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
import { ResellerCategoryData } from "@/lib/types/reseller-category";
import { getAll } from "@/lib/apiService";
import LoadingTable from "@/components/admin/loading-table";
import ErrorTable from "@/components/admin/error-table";
import DeleteButton from "@/components/admin/delete-button";

export default function TableResellerCategory() {
  const [resellerCategoryData, setResellerCategoryData] = useState<
    ResellerCategoryData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResellerCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<ResellerCategoryData>(
        "/api/admin/reseller-categories"
      );

      if (response.data) {
        setResellerCategoryData(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellerCategories();
  }, []);

  if (loading) {
    return <LoadingTable text="Loading fetch reseller categories" />;
  }

  if (error) {
    return <ErrorTable error={error} handleClick={fetchResellerCategories} />;
  }

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
          {resellerCategoryData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No reselller categories found
              </TableCell>
            </TableRow>
          ) : (
            resellerCategoryData.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.resellerCategoryName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.currency}</Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.isActive ? "Active" : "Non Active"}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link
                          href={`/dashboard/reseller-categories/edit/${item._id}`}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="p-0">
                        <DeleteButton
                          id={item._id}
                          onFetch={fetchResellerCategories}
                          resource="reseller-categories"
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
