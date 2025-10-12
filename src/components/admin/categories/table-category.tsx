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
import { Edit, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAll } from "@/lib/apiService";
import { showErrorAlert } from "@/lib/helpers/sweetalert2";
import { CategoryData } from "@/lib/types/category";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "@/components/admin/delete-button";
import Link from "next/link";
import Image from "next/image";

export default function TableCategory() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<CategoryData>("/api/admin/categories");

      if (response.data) {
        setCategories(response.data);
      }
    } catch (err: any) {
      setError(err.message);

      showErrorAlert(undefined, err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Loading categories...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">Error: {error}</p>
            <Button onClick={fetchCategories} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Display Web</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No categories found
              </TableCell>
            </TableRow>
          ) : (
            categories.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium ">
                  <Image
                    src={item.imageUrl}
                    width={150}
                    height={50}
                    alt={`Gambar ${item.name}`}
                    className="object-cover aspect-square"
                  />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.isDisplayed
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.isDisplayed ? "Yes" : "No"}
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
                        <Link href={`/dashboard/categories/edit/${item._id}`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="p-0">
                        <DeleteButton
                          id={item._id}
                          onFetch={fetchCategories}
                          resource="categories"
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
