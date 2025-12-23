"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import Image from "next/image";
import { X } from "lucide-react";

interface Reel {
  _id: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  link: string;
  show: boolean;
  order: number;
  likes: number;
  views: number;
}

interface FormReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: Reel | null;
  onSuccess: () => void;
}

export default function FormReelModal({
  isOpen,
  onClose,
  editData,
  onSuccess,
}: FormReelModalProps) {
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    link: "",
    show: true,
    order: 0,
    likes: 0,
    views: 0,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        link: editData.link,
        show: editData.show,
        order: editData.order,
        likes: editData.likes || 0,
        views: editData.views || 0,
      });
      setThumbnailPreview(editData.thumbnailUrl);
      setThumbnailFile(null);
    } else {
      setFormData({
        link: "",
        show: true,
        order: 0,
        likes: 0,
        views: 0,
      });
      setThumbnailPreview("");
      setThumbnailFile(null);
    }
  }, [editData, isOpen]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showErrorAlert("Error", "Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorAlert("Error", "File size must be less than 5MB");
        return;
      }

      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(editData?.thumbnailUrl || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!editData && !thumbnailFile) {
        throw new Error("Thumbnail image is required");
      }
      if (!formData.link) {
        throw new Error("Link is required");
      }

      const submitData = new FormData();
      if (thumbnailFile) {
        submitData.append("thumbnail", thumbnailFile);
        submitData.append("isNewThumbnail", "true");
      } else {
        submitData.append("isNewThumbnail", "false");
      }
      submitData.append("link", formData.link);
      submitData.append("show", formData.show.toString());
      submitData.append("order", formData.order.toString());
      submitData.append("likes", formData.likes.toString());
      submitData.append("views", formData.views.toString());

      const url = editData
        ? `/api/admin/reels/${editData._id}`
        : "/api/admin/reels";
      const method = editData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccessAlert(
          "Success",
          `Reel ${editData ? "updated" : "created"} successfully`
        );
        onSuccess();
        onClose();
      } else {
        throw new Error(
          result.message || `Failed to ${editData ? "update" : "create"} reel`
        );
      }
    } catch (error: any) {
      console.error("Error submitting reel:", error);
      showErrorAlert(
        "Error",
        error.message || `Failed to ${editData ? "update" : "create"} reel`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Reel" : "Add New Reel"}</DialogTitle>
          <DialogDescription>
            {editData
              ? "Update the reel information below"
              : "Fill in the details to add a new reel"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="thumbnail">
              Thumbnail Image <span className="text-red-500">*</span>
            </Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              disabled={loading}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Recommended size: <strong>1080 × 1920px (9:16)</strong> • Max 5MB
              • JPG, PNG, or WebP
            </p>
            {thumbnailPreview && (
              <div className="relative w-32 h-48 rounded overflow-hidden border mt-2">
                <Image
                  src={thumbnailPreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                {thumbnailFile && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveThumbnail}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">
              Reel Link <span className="text-red-500">*</span>
            </Label>
            <Input
              id="link"
              type="url"
              placeholder="https://instagram.com/reel/..."
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              placeholder="0"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value) || 0,
                })
              }
            />
            <p className="text-sm text-gray-500">Lower numbers appear first</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="likes">Likes</Label>
              <Input
                id="likes"
                type="number"
                placeholder="0"
                min="0"
                value={formData.likes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    likes: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="views">Views</Label>
              <Input
                id="views"
                type="number"
                placeholder="0"
                min="0"
                value={formData.views}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    views: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show">Show on Website</Label>
              <p className="text-sm text-gray-500">
                Toggle to show/hide this reel on the public website
              </p>
            </div>
            <Switch
              id="show"
              checked={formData.show}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
