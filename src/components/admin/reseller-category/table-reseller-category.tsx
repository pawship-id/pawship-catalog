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

interface TableResellerCategoryProps {
  searchQuery: string;
}

export default function TableResellerCategory({
  searchQuery,
}: TableResellerCategoryProps) {
  const [resellerCategoryData, setResellerCategoryData] = useState<
    ResellerCategoryData[]
  >([]);
  const [filteredData, setFilteredData] = useState<ResellerCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchResellerCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<ResellerCategoryData>(
        "/api/admin/reseller-categories"
      );

      if (response.data) {
        setResellerCategoryData(response.data);
        setFilteredData(response.data);
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

  // Search filter effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(resellerCategoryData);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = resellerCategoryData.filter((item) =>
      item.resellerCategoryName.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  }, [searchQuery, resellerCategoryData]);

  if (loading) {
    return <LoadingTable text="Loading fetch reseller categories" />;
  }

  if (error) {
    return <ErrorTable error={error} handleClick={fetchResellerCategories} />;
  }

  return (
    <div className="space-y-4">
      {/* Results Counter */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredData.length} reseller categor
          {filteredData.length !== 1 ? "ies" : "y"} matching "{searchQuery}"
        </div>
      )}

      {/* Table */}
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
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery
                    ? `No reseller categories found matching "${searchQuery}"`
                    : "No reseller categories found"}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
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

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between my-6">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
            reseller categories
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="cursor-pointer w-10"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
