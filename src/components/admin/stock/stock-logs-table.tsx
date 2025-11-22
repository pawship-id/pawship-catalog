"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import LoadingTable from "@/components/admin/loading-table";
import { showErrorAlert } from "@/lib/helpers/sweetalert2";

interface StockLog {
  _id: string;
  product: {
    productName: string;
    slug: string;
  };
  variantProduct: {
    name: string;
    sku: string;
  };
  sku: string;
  oldStock: number;
  newStock: number;
  updatedBy: string;
  updatedAt: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function StockLogsTable() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [searchSKU, setSearchSKU] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, searchSKU]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchSKU) {
        params.append("sku", searchSKU);
      }

      const response = await fetch(`/api/admin/stock/logs?${params}`);
      const result = await response.json();

      if (result.success) {
        setLogs(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showErrorAlert("Error", error.message || "Failed to fetch stock logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchSKU(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchSKU("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getStockChangeColor = (oldStock: number, newStock: number) => {
    if (newStock > oldStock) return "text-green-600";
    if (newStock < oldStock) return "text-red-600";
    return "text-gray-600";
  };

  const getStockDifference = (oldStock: number, newStock: number) => {
    const diff = newStock - oldStock;
    if (diff > 0) return `+${diff}`;
    return diff.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Stock Update History
        </CardTitle>
        <CardDescription>
          View all stock changes from bulk updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search & Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="default">
            Search
          </Button>
          {searchSKU && (
            <Button onClick={handleClearSearch} variant="outline">
              Clear
            </Button>
          )}
          <Button onClick={fetchLogs} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingTable text="Loading stock logs" />
        ) : (
          <>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-center">Old Stock</TableHead>
                    <TableHead className="text-center">New Stock</TableHead>
                    <TableHead className="text-center">Change</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        No stock update logs found
                        {searchSKU && (
                          <p className="text-sm mt-1">
                            Try a different search term
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="font-mono text-sm">
                          <Badge variant="outline">{log.sku}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="font-medium truncate">
                              {log.product?.productName || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px]">
                            <p className="text-sm truncate">
                              {log.variantProduct?.name || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{log.oldStock}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">{log.newStock}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-semibold ${getStockChangeColor(
                              log.oldStock,
                              log.newStock
                            )}`}
                          >
                            {getStockDifference(log.oldStock, log.newStock)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600 truncate max-w-[150px]">
                            {log.updatedBy}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600">
                            {format(new Date(log.updatedAt), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(log.updatedAt), "HH:mm:ss")}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {logs.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.totalCount
                  )}{" "}
                  of {pagination.totalCount} logs
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => {
                      const page = i + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 1 &&
                          page <= pagination.page + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={
                              page === pagination.page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === pagination.page - 2 ||
                        page === pagination.page + 2
                      ) {
                        return (
                          <span key={page} className="px-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
