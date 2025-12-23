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
import { Edit, MoreVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoadingTable from "@/components/admin/loading-table";
import ErrorTable from "@/components/admin/error-table";
import DeleteButton from "@/components/admin/delete-button";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import Image from "next/image";

interface Reel {
  _id: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  link: string;
  show: boolean;
  order: number;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface TableReelProps {
  onEdit: (reel: Reel) => void;
  refreshTrigger: number;
}

export default function TableReel({ onEdit, refreshTrigger }: TableReelProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchReels();
  }, [currentPage, refreshTrigger]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/reels?page=${currentPage}&limit=${itemsPerPage}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reels");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setReels(result.data);
        setTotalCount(result.pagination.totalCount);
        setTotalPages(result.pagination.totalPages);
      } else {
        throw new Error(result.message || "Failed to fetch reels");
      }
    } catch (err: any) {
      console.error("Error fetching reels:", err);
      setError(err.message || "Failed to fetch reels");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShow = async (id: string, currentShow: boolean) => {
    try {
      const response = await fetch(`/api/admin/reels/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          show: !currentShow,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccessAlert("Success", "Reel visibility updated");
        fetchReels();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showErrorAlert("Error", error.message || "Failed to update reel");
    }
  };

  if (loading) {
    return <LoadingTable text="Loading reels..." />;
  }

  if (error) {
    return <ErrorTable error={error} handleClick={fetchReels} />;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Show</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reels.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No reels found
                </TableCell>
              </TableRow>
            ) : (
              reels.map((reel) => (
                <TableRow key={reel._id}>
                  <TableCell>
                    <div className="relative w-16 h-24 rounded overflow-hidden">
                      <Image
                        src={reel.thumbnailUrl}
                        alt="Reel thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={reel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="truncate max-w-xs">{reel.link}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={reel.show}
                      onCheckedChange={() =>
                        handleToggleShow(reel._id, reel.show)
                      }
                    />
                  </TableCell>
                  <TableCell>{reel.order}</TableCell>
                  <TableCell>{reel.likes?.toLocaleString() || 0}</TableCell>
                  <TableCell>{reel.views?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    {new Date(reel.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onEdit(reel)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-0">
                          <DeleteButton
                            id={reel._id}
                            onFetch={fetchReels}
                            resource="reels"
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
      {reels.length > 0 && (
        <div className="flex items-center justify-between my-6">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount}{" "}
            reels
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
