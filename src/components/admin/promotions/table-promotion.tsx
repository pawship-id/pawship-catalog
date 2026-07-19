"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreVertical } from "lucide-react";
import { getAll } from "@/lib/apiService";
import DeleteButton from "@/components/admin/delete-button";
import LoadingTable from "@/components/admin/loading-table";
import ErrorTable from "@/components/admin/error-table";
import type { PromotionData } from "@/lib/types/promotion";

interface TablePromotionProps {
  searchQuery: string;
}

type Derived = "Inactive" | "Upcoming" | "Expired" | "Active";

function deriveStatus(p: PromotionData): Derived {
  if (p.status === "INACTIVE") return "Inactive";
  const now = Date.now();
  if (now < new Date(p.startAt).getTime()) return "Upcoming";
  if (now > new Date(p.endAt).getTime()) return "Expired";
  return "Active";
}

const STATUS_CLASS: Record<Derived, string> = {
  Active: "bg-green-100 text-green-700 border-green-200",
  Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
  Expired: "bg-red-100 text-red-700 border-red-200",
  Inactive: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function TablePromotion({ searchQuery }: TablePromotionProps) {
  const [promotions, setPromotions] = useState<PromotionData[]>([]);
  const [filtered, setFiltered] = useState<PromotionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const current = filtered.slice(startIndex, endIndex);

  useEffect(() => setCurrentPage(1), [searchQuery]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAll<PromotionData>("/api/admin/promotions");
      if (response.data) {
        setPromotions(response.data);
        setFiltered(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(promotions);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFiltered(
      promotions.filter(
        (p) =>
          p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, promotions]);

  if (loading) return <LoadingTable text="Loading fetch promotions" />;
  if (error) return <ErrorTable error={error} handleClick={fetchPromotions} />;

  return (
    <div className="space-y-4">
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filtered.length} promotion{filtered.length !== 1 ? "s" : ""}{" "}
          matching "{searchQuery}"
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery
                    ? `No promotions found matching "${searchQuery}"`
                    : "No promotions found"}
                </TableCell>
              </TableRow>
            ) : (
              current.map((item) => {
                const derived = deriveStatus(item);
                return (
                  <TableRow key={item._id}>
                    <TableCell className="font-mono font-medium">
                      {item.code}
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_CLASS[derived]}
                      >
                        {derived}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.endAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/dashboard/promotions/${item._id}/detail`}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/dashboard/promotions/${item._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="p-0">
                            <DeleteButton
                              id={item._id}
                              onFetch={fetchPromotions}
                              resource="promotions"
                            />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between my-6">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of{" "}
            {filtered.length} promotions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="cursor-pointer w-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
