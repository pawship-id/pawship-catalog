"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { Eye } from "lucide-react";

interface BannerFormData {
  title: string;
  description: string;
  page: string;
  desktopImage: File | string | null;
  mobileImage: File | string | null;
  buttonText: string;
  buttonUrl: string;
  buttonColor: string;
  buttonPosition: string;
  textColor: string;
  overlayColor: string;
  textPosition: string;
  order: number;
  isActive: boolean;
}

interface FormBannerProps {
  mode: "create" | "edit";
  initialData?: any;
  bannerId?: string;
}

export default function FormBanner({
  mode,
  initialData,
  bannerId,
}: FormBannerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    description: "",
    page: "home",
    desktopImage: null,
    mobileImage: null,
    buttonText: "",
    buttonUrl: "",
    buttonColor: "#FF6B35",
    buttonPosition: "center",
    textColor: "#FFFFFF",
    overlayColor: "",
    textPosition: "center",
    order: 0,
    isActive: true,
  });

  const [desktopPreview, setDesktopPreview] = useState<string>("");
  const [mobilePreview, setMobilePreview] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        page: initialData.page || "home",
        desktopImage: initialData.desktopImageUrl || null,
        mobileImage: initialData.mobileImageUrl || null,
        buttonText: initialData.button?.text || "",
        buttonUrl: initialData.button?.url || "",
        buttonColor: initialData.button?.color || "#FF6B35",
        buttonPosition: initialData.button?.position || "center",
        textColor: initialData.style?.textColor || "#FFFFFF",
        overlayColor: initialData.style?.overlayColor || "",
        textPosition: initialData.style?.textPosition || "center",
        order: initialData.order || 0,
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
      });

      if (initialData.desktopImageUrl) {
        setDesktopPreview(initialData.desktopImageUrl);
      }
      if (initialData.mobileImageUrl) {
        setMobilePreview(initialData.mobileImageUrl);
      }
    }
  }, [mode, initialData]);

  const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, desktopImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setDesktopPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, mobileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setMobilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMobileImage = () => {
    setFormData({ ...formData, mobileImage: null });
    setMobilePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.title) {
        throw new Error("Title is required");
      }

      if (mode === "create" && !formData.desktopImage) {
        throw new Error("Desktop image is required");
      }

      // Create FormData
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("page", formData.page);
      submitData.append("buttonText", formData.buttonText);
      submitData.append("buttonUrl", formData.buttonUrl);
      submitData.append("buttonColor", formData.buttonColor);
      submitData.append("buttonPosition", formData.buttonPosition);
      submitData.append("textColor", formData.textColor);
      submitData.append("overlayColor", formData.overlayColor);
      submitData.append("textPosition", formData.textPosition);
      submitData.append("order", formData.order.toString());
      submitData.append("isActive", formData.isActive.toString());

      // Handle images
      if (mode === "create") {
        if (formData.desktopImage instanceof File) {
          submitData.append("desktopImage", formData.desktopImage);
        }
        if (formData.mobileImage instanceof File) {
          submitData.append("mobileImage", formData.mobileImage);
        }
      } else {
        // Edit mode
        if (formData.desktopImage instanceof File) {
          submitData.append("desktopImage", formData.desktopImage);
          submitData.append("isNewDesktopImage", "true");
        } else {
          submitData.append("isNewDesktopImage", "false");
        }

        if (formData.mobileImage instanceof File) {
          submitData.append("mobileImage", formData.mobileImage);
          submitData.append("isNewMobileImage", "true");
        } else if (
          formData.mobileImage === null &&
          initialData?.mobileImageUrl
        ) {
          submitData.append("removeMobileImage", "true");
        } else {
          submitData.append("isNewMobileImage", "false");
        }
      }

      const url =
        mode === "create"
          ? "/api/admin/banners"
          : `/api/admin/banners/${bannerId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccessAlert(
          "Success",
          `Banner ${mode === "create" ? "created" : "updated"} successfully`
        );
        router.push("/dashboard/banners");
      } else {
        throw new Error(result.message || `Failed to ${mode} banner`);
      }
    } catch (error: any) {
      console.error("Error submitting banner:", error);
      showErrorAlert("Error", error.message || `Failed to ${mode} banner`);
    } finally {
      setLoading(false);
    }
  };

  const getTextAlignment = (position: string) => {
    switch (position) {
      case "left":
        return "text-left items-start";
      case "right":
        return "text-right items-end";
      default:
        return "text-center items-center";
    }
  };

  const getButtonAlignment = (position: string) => {
    switch (position) {
      case "left":
        return "justify-start";
      case "right":
        return "justify-end";
      default:
        return "justify-center";
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page">Page</Label>
              <Select
                value={formData.page}
                onValueChange={(value) =>
                  setFormData({ ...formData, page: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="our-collection">Our Collection</SelectItem>
                  <SelectItem value="reseller-program">
                    Reseller Program
                  </SelectItem>
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

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">Images</h3>

          <div className="space-y-2">
            <Label htmlFor="desktopImage">
              Desktop Image <span className="text-red-500">*</span>
            </Label>
            <Input
              id="desktopImage"
              type="file"
              accept="image/*"
              onChange={handleDesktopImageChange}
            />
            {desktopPreview && (
              <img
                src={desktopPreview}
                alt="Desktop Preview"
                className="w-full max-w-2xl h-48 object-cover rounded-lg border mt-2"
              />
            )}
            <p className="text-sm text-gray-500">
              Recommended: 1920 x 600 pixels
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileImage">Mobile Image (Optional)</Label>
            <Input
              id="mobileImage"
              type="file"
              accept="image/*"
              onChange={handleMobileImageChange}
            />
            {mobilePreview && (
              <div className="relative">
                <img
                  src={mobilePreview}
                  alt="Mobile Preview"
                  className="w-full max-w-sm h-48 object-cover rounded-lg border mt-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={handleRemoveMobileImage}
                >
                  Remove
                </Button>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Recommended: 768 x 600 pixels. If not provided, desktop image will
              be used.
            </p>
          </div>
        </div>

        {/* Button Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">Button Settings (Optional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) =>
                  setFormData({ ...formData, buttonText: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonUrl">Button URL</Label>
              <Input
                id="buttonUrl"
                value={formData.buttonUrl}
                onChange={(e) =>
                  setFormData({ ...formData, buttonUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonColor">Button Color</Label>
              <div className="flex gap-2">
                <Input
                  id="buttonColor"
                  type="color"
                  value={formData.buttonColor}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonColor: e.target.value })
                  }
                  className="w-20"
                />
                <Input
                  value={formData.buttonColor}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonColor: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonPosition">Button Position</Label>
              <Select
                value={formData.buttonPosition}
                onValueChange={(value) =>
                  setFormData({ ...formData, buttonPosition: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Style Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">Style Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) =>
                    setFormData({ ...formData, textColor: e.target.value })
                  }
                  className="w-20"
                />
                <Input
                  value={formData.textColor}
                  onChange={(e) =>
                    setFormData({ ...formData, textColor: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overlayColor">
                Background Overlay (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="overlayColor"
                  type="color"
                  value={formData.overlayColor || "#000000"}
                  onChange={(e) =>
                    setFormData({ ...formData, overlayColor: e.target.value })
                  }
                  className="w-20"
                />
                <Input
                  value={formData.overlayColor}
                  onChange={(e) =>
                    setFormData({ ...formData, overlayColor: e.target.value })
                  }
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textPosition">Text Position</Label>
              <Select
                value={formData.textPosition}
                onValueChange={(value) =>
                  setFormData({ ...formData, textPosition: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}{" "}
              Banner
            </Button>
          </div>
        </div>
      </form>

      {/* Preview */}
      {showPreview && (desktopPreview || mobilePreview) && (
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={!isMobile ? "default" : "outline"}
                onClick={() => setIsMobile(false)}
              >
                Desktop
              </Button>
              <Button
                size="sm"
                variant={isMobile ? "default" : "outline"}
                onClick={() => setIsMobile(true)}
              >
                Mobile
              </Button>
            </div>
          </div>

          {/* Info banner size */}
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
            {formData.page === "home" ? (
              <p>
                <strong>Home Page Banner:</strong> Desktop{" "}
                {isMobile ? "" : "(current)"}: 600px height | Mobile{" "}
                {isMobile ? "(current)" : ""}: 400px height
              </p>
            ) : (
              <p>
                <strong>Other Pages Banner:</strong> Desktop{" "}
                {isMobile ? "" : "(current)"}: 400px height | Mobile{" "}
                {isMobile ? "(current)" : ""}: 300px height
              </p>
            )}
          </div>

          <div
            className={`relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 ${
              isMobile ? "max-w-sm mx-auto" : "w-full"
            }`}
            style={{
              height:
                formData.page === "home"
                  ? isMobile
                    ? "400px"
                    : "600px"
                  : isMobile
                    ? "300px"
                    : "400px",
            }}
          >
            <img
              src={isMobile && mobilePreview ? mobilePreview : desktopPreview}
              alt="Banner Preview"
              className="w-full h-full object-cover"
            />
            {formData.overlayColor && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: formData.overlayColor,
                  opacity: 0.5,
                }}
              />
            )}
            <div
              className={`absolute inset-0 flex flex-col ${getTextAlignment(
                formData.textPosition
              )} justify-center p-8 space-y-4`}
            >
              <h2
                className="text-4xl font-bold"
                style={{ color: formData.textColor }}
              >
                {formData.title || "Banner Title"}
              </h2>
              {formData.description && (
                <p className="text-lg" style={{ color: formData.textColor }}>
                  {formData.description}
                </p>
              )}
              {formData.buttonText && formData.buttonUrl && (
                <div
                  className={`flex ${getButtonAlignment(formData.buttonPosition)}`}
                >
                  <button
                    className="px-6 py-3 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: formData.buttonColor }}
                  >
                    {formData.buttonText}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
