"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
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

interface TablePromoProps {
  searchQuery: string;
}

export default function TablePromo({ searchQuery }: TablePromoProps) {
  const router = useRouter();
  const [promos, setPromos] = useState<PromoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromos();
  }, []);

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

  const handleDelete = async (id: string, promoName: string) => {
    if (!confirm(`Are you sure you want to delete promo "${promoName}"?`)) {
      return;
    }

    try {
      await deleteById("/api/admin/promos", id);
      alert("Promo deleted successfully!");
      fetchPromos();
    } catch (error: any) {
      console.error("Error deleting promo:", error);
      alert(error.message || "Failed to delete promo");
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
              filteredPromos.map((promo) => (
                <TableRow key={promo._id}>
                  <TableCell className="font-medium">
                    {promo.promoName}
                  </TableCell>
                  <TableCell>{formatDate(promo.startDate)}</TableCell>
                  <TableCell>{formatDate(promo.endDate)}</TableCell>
                  <TableCell>{promo.products.length} product(s)</TableCell>
                  <TableCell>{getPromoStatus(promo)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/dashboard/promos/${promo._id}/edit`)
                        }
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(promo._id, promo.promoName)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
