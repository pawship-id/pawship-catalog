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
import { Edit, Eye, MoreVertical } from "lucide-react";
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
import DeleteButton from "@/components/admin/delete-button";

interface TableProductProps {
  searchQuery: string;
  selectedCategory: string;
}

export default function TableProduct({
  searchQuery,
  selectedCategory,
}: TableProductProps) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<ProductData>("/api/admin/products");

      if (response.data) {
        setProducts(response.data);
        setFilteredProducts(response.data);
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

  // Filter products based on search query and category
  useEffect(() => {
    let filtered = [...products];

    // Filter by search query (product name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.productName.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.categoryId === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  if (loading) {
    return <LoadingTable text="Loading fetch products" />;
  }

  if (error) {
    return <ErrorTable error={error} handleClick={fetchProducts} />;
  }

  return (
    <div className="space-y-4">
      {/* Results Counter */}
      {(searchQuery || selectedCategory !== "all") && (
        <div className="text-sm text-muted-foreground">
          Found {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== "all" && " in selected category"}
        </div>
      )}

      {/* Table */}
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
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery || selectedCategory !== "all"
                    ? "No products found matching your filters"
                    : "No products found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((item) => (
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
                    {item.categoryDetail ? (
                      <Badge variant="outline">
                        {item.categoryDetail.name}
                      </Badge>
                    ) : (
                      "-"
                    )}
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
                          <Link href={`/dashboard/products/${item._id}/detail`}>
                            <Eye className="mr-2 h-4 w-4" /> Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href={`/dashboard/products/${item._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-0">
                          <DeleteButton
                            id={item._id}
                            onFetch={fetchProducts}
                            resource="products"
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
    </div>
  );
}
