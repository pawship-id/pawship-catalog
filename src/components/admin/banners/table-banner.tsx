"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Info } from "lucide-react";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/lib/helpers/sweetalert2";
import Image from "next/image";
import LoadingTable from "../loading-table";
// Tooltip removed - add manually if needed

interface Banner {
  _id: string;
  page: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  button?: {
    text: string;
    url: string;
    color: string;
    position: {
      desktop: {
        horizontal: string;
        vertical: string;
      };
      mobile?: {
        horizontal: string;
        vertical: string;
      };
    };
  };
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TableBanner() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPage, setFilterPage] = useState<string>("all");

  useEffect(() => {
    fetchBanners();
  }, [filterPage]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const url =
        filterPage === "all"
          ? "/api/admin/banners"
          : `/api/admin/banners?page=${filterPage}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setBanners(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showErrorAlert("Error", error.message || "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        showSuccessAlert(
          "Success",
          `Banner ${!currentStatus ? "activated" : "deactivated"} successfully`
        );
        fetchBanners();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showErrorAlert(
        "Error",
        error.message || "Failed to update banner status"
      );
    }
  };

  const handleDelete = async (id: string, page: string) => {
    const confirm = await showConfirmAlert(
      "Delete Banner",
      `Are you sure you want to delete this banner from ${page}?`
    );

    if (confirm) {
      try {
        const response = await fetch(`/api/admin/banners/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          showSuccessAlert("Success", "Banner deleted successfully");
          fetchBanners();
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        showErrorAlert("Error", error.message || "Failed to delete banner");
      }
    }
  };

  const getPageLabel = (page: string) => {
    const pageMap: { [key: string]: string } = {
      home: "Home",
      "our-collection": "Our Collection",
      "reseller-program": "Reseller Program",
      "reseller-whitelabeling": "Reseller Whitelabeling",
      "about-us": "About Us",
      "contact-us": "Contact Us",
      stores: "Stores",
      payment: "Payment",
    };
    return pageMap[page] || page;
  };

  const handleReorder = async (draggedId: string, targetId: string) => {
    const draggedIndex = banners.findIndex((b) => b._id === draggedId);
    const targetIndex = banners.findIndex((b) => b._id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newBanners = [...banners];
    const [draggedBanner] = newBanners.splice(draggedIndex, 1);
    newBanners.splice(targetIndex, 0, draggedBanner);

    // Update order values
    const updatedBanners = newBanners.map((banner, index) => ({
      ...banner,
      order: index,
    }));

    setBanners(updatedBanners);

    try {
      const response = await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banners: updatedBanners.map((b) => ({ id: b._id, order: b.order })),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showErrorAlert("Error", error.message || "Failed to reorder banners");
      fetchBanners(); // Revert on error
    }
  };

  if (loading) {
    return <LoadingTable text="Loading fetch banners" />;
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by Page:</label>
        <Select value={filterPage} onValueChange={setFilterPage}>
          <SelectTrigger
            className="w-[200px] border-gray-300 focus:border-primary/80
            focus:ring-primary/80"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pages</SelectItem>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="our-collection">Our Collection</SelectItem>
            <SelectItem value="reseller-program">Reseller Program</SelectItem>
            <SelectItem value="reseller-whitelabeling">
              Reseller Whitelabeling
            </SelectItem>
            <SelectItem value="about-us">About Us</SelectItem>
            <SelectItem value="contact-us">Contact Us</SelectItem>
            <SelectItem value="stores">Stores</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Drag</TableHead>
              <TableHead className="w-[120px]">Preview</TableHead>
              <TableHead>Page</TableHead>
              <TableHead className="text-center">Order</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No banners found. Create your first banner!
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow
                  key={banner._id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", banner._id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData("text/plain");
                    if (draggedId !== banner._id) {
                      handleReorder(draggedId, banner._id);
                    }
                  }}
                  className="cursor-move hover:bg-gray-50"
                >
                  {/* Drag Handle */}
                  <TableCell>
                    <div className="flex items-center justify-center text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                      </svg>
                    </div>
                  </TableCell>

                  {/* Preview */}
                  <TableCell>
                    <div className="relative w-24 h-16 rounded overflow-hidden border">
                      <Image
                        src={banner.desktopImageUrl}
                        alt="Banner preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>

                  {/* Page */}
                  <TableCell>
                    <div className="font-medium">
                      {getPageLabel(banner.page)}
                    </div>
                  </TableCell>

                  {/* Order */}
                  <TableCell className="text-center">
                    <Badge variant="outline">{banner.order}</Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() =>
                          handleToggleStatus(banner._id, banner.isActive)
                        }
                      />
                      <span className="text-sm text-gray-600">
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/banners/edit/${banner._id}`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(banner._id, banner.page)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
