"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import { PromoData } from "@/lib/types/promo";
import { getAll, deleteById } from "@/lib/apiService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingTable from "@/components/admin/loading-table";
import ErrorTable from "@/components/admin/error-table";
import DeleteButton from "../delete-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface TablePromoProps {
  searchQuery: string;
}

export default function TablePromo({ searchQuery }: TablePromoProps) {
  const [promos, setPromos] = useState<PromoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchPromos();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchPromos = async () => {
    try {
      const response = await getAll<PromoData>("/api/admin/promos");
      if (response.data) {
        setPromos(response.data);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching promos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPromoStatus = (promo: PromoData) => {
    if (!promo.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (now < startDate) {
      return <Badge variant="outline">Upcoming</Badge>;
    } else if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return (
        <Badge variant="default" className="bg-green-600">
          Active
        </Badge>
      );
    }
  };

  // Filter promos based on search query
  const filteredPromos = useMemo(() => {
    if (!searchQuery.trim()) return promos;

    const query = searchQuery.toLowerCase();
    return promos.filter((promo) => {
      // Search in promo name
      if (promo.promoName.toLowerCase().includes(query)) return true;

      // Search in product names
      if (
        promo.products.some((product) =>
          product.productName.toLowerCase().includes(query)
        )
      ) {
        return true;
      }

      // Search in dates
      const startDate = formatDate(promo.startDate).toLowerCase();
      const endDate = formatDate(promo.endDate).toLowerCase();
      if (startDate.includes(query) || endDate.includes(query)) return true;

      return false;
    });
  }, [promos, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPromos = filteredPromos.slice(startIndex, endIndex);

  if (loading) {
    return <LoadingTable text="Loading fetch promotions" />;
  }

  if (error) {
    return <ErrorTable error={error} handleClick={fetchPromos} />;
  }

  return (
    <div className="space-y-4">
      {/* Results Counter */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredPromos.length} promotion
          {filteredPromos.length !== 1 ? "s" : ""} matching "{searchQuery}"
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promo Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromos.length === 0 ? (
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
              currentPromos.map((promo) => (
                <TableRow key={promo._id}>
                  <TableCell className="font-medium">
                    {promo.promoName}
                  </TableCell>
                  <TableCell>{formatDate(promo.startDate)}</TableCell>
                  <TableCell>{formatDate(promo.endDate)}</TableCell>
                  <TableCell>{promo.products.length} product(s)</TableCell>
                  <TableCell>{getPromoStatus(promo)}</TableCell>
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
                          <Link href={`/dashboard/promos/${promo._id}/detail`}>
                            <Eye className="mr-2 h-4 w-4" /> Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href={`/dashboard/promos/${promo._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-0">
                          <DeleteButton
                            id={promo._id}
                            onFetch={fetchPromos}
                            resource="promos"
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
      {filteredPromos.length > 0 && (
        <div className="flex items-center justify-between my-6">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredPromos.length)} of{" "}
            {filteredPromos.length} promotion
            {filteredPromos.length !== 1 ? "s" : ""}
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
