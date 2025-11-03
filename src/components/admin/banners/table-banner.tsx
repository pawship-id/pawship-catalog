"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { showErrorAlert, showConfirmAlert } from "@/lib/helpers/sweetalert2";
import { getAll } from "@/lib/apiService";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Banner {
  _id: string;
  title: string;
  page: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

function SortableRow({ banner, onEdit, onDelete, onToggleActive }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div {...attributes} {...listeners} className="cursor-move">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </TableCell>
      <TableCell>
        <img
          src={banner.desktopImageUrl}
          alt={banner.title}
          className="w-24 h-16 object-cover rounded"
        />
      </TableCell>
      <TableCell className="font-medium">{banner.title}</TableCell>
      <TableCell>
        <Badge variant="secondary">{banner.page}</Badge>
      </TableCell>
      <TableCell>{banner.order}</TableCell>
      <TableCell>
        <Switch
          checked={banner.isActive}
          onCheckedChange={() => onToggleActive(banner._id, !banner.isActive)}
        />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(banner._id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(banner._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function TableBanner() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<string>("home");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getAll<Banner>(
        `/api/admin/banners?page=${selectedPage}`
      );
      if (response.data) {
        setBanners(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching banners:", error);
      showErrorAlert("Error", "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [selectedPage]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b._id === active.id);
      const newIndex = banners.findIndex((b) => b._id === over.id);

      const newBanners = arrayMove(banners, oldIndex, newIndex);

      // Update order values
      const updatedBanners = newBanners.map(
        (banner: Banner, index: number) => ({
          ...banner,
          order: index,
        })
      );

      setBanners(updatedBanners);

      // Save to server
      try {
        const response = await fetch("/api/admin/banners", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            banners: updatedBanners.map((b: Banner) => ({
              _id: b._id,
              order: b.order,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order");
        }
      } catch (error) {
        console.error("Error updating order:", error);
        showErrorAlert("Error", "Failed to update banner order");
        // Revert on error
        fetchBanners();
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/banners/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmAlert(
      "Are you sure you want to delete this banner?",
      "Delete"
    );

    if (confirmed.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/banners/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchBanners();
        } else {
          throw new Error("Failed to delete banner");
        }
      } catch (error) {
        console.error("Error deleting banner:", error);
        showErrorAlert("Error", "Failed to delete banner");
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const banner = banners.find((b) => b._id === id);
      if (!banner) return;

      const formData = new FormData();
      formData.append("title", banner.title);
      formData.append("description", "");
      formData.append("page", banner.page);
      formData.append("buttonText", "");
      formData.append("buttonUrl", "");
      formData.append("buttonColor", "#FF6B35");
      formData.append("buttonPosition", "center");
      formData.append("textColor", "#FFFFFF");
      formData.append("overlayColor", "");
      formData.append("textPosition", "center");
      formData.append("order", banner.order.toString());
      formData.append("isActive", isActive.toString());
      formData.append("isNewDesktopImage", "false");
      formData.append("isNewMobileImage", "false");

      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        fetchBanners();
      } else {
        throw new Error("Failed to update banner");
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      showErrorAlert("Error", "Failed to update banner status");
    }
  };

  if (loading) {
    return <div>Loading banners...</div>;
  }

  const pageOptions = [
    { value: "home", label: "Home" },
    { value: "our-collection", label: "Our Collection" },
    { value: "reseller-program", label: "Reseller Program" },
    { value: "reseller-whitelabeling", label: "Reseller Whitelabeling" },
    { value: "about-us", label: "About Us" },
    { value: "contact-us", label: "Contact Us" },
    { value: "stores", label: "Stores" },
    { value: "payment", label: "Payment" },
  ];

  return (
    <div className="space-y-4">
      {/* Page Filter */}
      <div className="flex gap-2 flex-wrap">
        {pageOptions.map((page) => (
          <Button
            key={page.value}
            variant={selectedPage === page.value ? "default" : "outline"}
            onClick={() => setSelectedPage(page.value)}
          >
            {page.label}
          </Button>
        ))}
      </div>

      {/* Banner Table */}
      <div className="border rounded-lg">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead className="w-32">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Page</TableHead>
                <TableHead className="w-20">Order #</TableHead>
                <TableHead className="w-24">Active</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No banners found for {selectedPage} page
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={banners.map((b) => b._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {banners.map((banner) => (
                    <SortableRow
                      key={banner._id}
                      banner={banner}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
