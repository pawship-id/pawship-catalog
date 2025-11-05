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
import { Edit, Trash2, Info, MoreVertical } from "lucide-react";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/lib/helpers/sweetalert2";
import Image from "next/image";
import LoadingTable from "../loading-table";
import DeleteButton from "../delete-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
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
      const response = await fetch(`/api/admin/banners/update-status/${id}`, {
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

  // const handleDelete = async (id: string, page: string) => {
  //   const confirm = await showConfirmAlert(
  //     "Delete Banner",
  //     `Are you sure you want to delete this banner from ${page}?`
  //   );

  //   if (confirm) {
  //     try {
  //       const response = await fetch(`/api/admin/banners/${id}`, {
  //         method: "DELETE",
  //       });

  //       const result = await response.json();

  //       if (result.success) {
  //         showSuccessAlert("Success", "Banner deleted successfully");
  //         fetchBanners();
  //       } else {
  //         throw new Error(result.message);
  //       }
  //     } catch (error: any) {
  //       showErrorAlert("Error", error.message || "Failed to delete banner");
  //     }
  //   }
  // };

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
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  No banners found. Create your first banner!
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner._id} className="hover:bg-gray-50">
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
                        className="data-[state=unchecked]:bg-gray-200"
                      />
                      <span className="text-sm text-gray-600">
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center">
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
                          <Link href={`/dashboard/banners/edit/${banner._id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-0">
                          <DeleteButton
                            id={banner._id}
                            onFetch={fetchBanners}
                            resource="banners"
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
