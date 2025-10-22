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
import { getAll } from "@/lib/apiService";
import { ProductData } from "@/lib/types/product";
import LoadingTable from "@/components/admin/loading-table";
import ErrorTable from "@/components/admin/error-table";

export default function TableProduct() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<ProductData>("/api/admin/products");

      if (response.data) {
        setProducts(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingTable text="Loading fetch products" />;
  }

  if (error) {
    return <ErrorTable error={error} handleClick={fetchProducts} />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {item.productMedia?.length > 0 &&
                      (() => {
                        const firstImage = item.productMedia.find(
                          (media) => media.type === "image"
                        );

                        if (firstImage) {
                          return (
                            <div className="w-25 h-25 bg-muted rounded-md flex items-center justify-center">
                              <img
                                src={firstImage.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {item.productDescription}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category.name}</Badge>
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
                        <Link href={`/dashboard/categories/edit/1`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="p-0">
                        {/* <DeleteButton
                      id={item._id}
                      onFetch={fetchCategories}
                      resource="categories"
                    /> */}
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
