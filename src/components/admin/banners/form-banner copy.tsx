"use client";
import { useState, useEffect, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { Eye, Move } from "lucide-react";

interface PositionCoordinates {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

interface DeviceButtonSettings {
  text: string;
  url: string;
  color: string;
  position: PositionCoordinates;
}

interface DeviceStyleSettings {
  textColor: string;
  overlayColor: string;
  textPosition: PositionCoordinates;
}

interface BannerFormData {
  title: string;
  description: string;
  page: string;
  desktopImage: File | string | null;
  mobileImage?: File | string | null;
  button?: {
    desktop: DeviceButtonSettings;
    mobile?: DeviceButtonSettings;
  };
  style?: {
    desktop: DeviceStyleSettings;
    mobile?: DeviceStyleSettings;
  };
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
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [activeTab, setActiveTab] = useState<"desktop" | "mobile">("desktop");
  const [draggingElement, setDraggingElement] = useState<
    "text" | "button" | null
  >(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewOuterRef = useRef<HTMLDivElement>(null);
  const previewInnerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(1);

  const defaultButtonDesktop: DeviceButtonSettings = {
    text: "",
    url: "",
    color: "#FF6B35",
    position: { x: 50, y: 70 },
  };

  const defaultStyleDesktop: DeviceStyleSettings = {
    textColor: "#FFFFFF",
    overlayColor: "",
    textPosition: { x: 50, y: 50 },
  };

  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    description: "",
    page: "home",
    desktopImage: null,
    mobileImage: undefined,
    button: {
      desktop: defaultButtonDesktop,
      mobile: undefined,
    },
    style: {
      desktop: defaultStyleDesktop,
      mobile: undefined,
    },
    order: 0,
    isActive: false,
  });

  const [desktopPreview, setDesktopPreview] = useState<string>("");
  const [mobilePreview, setMobilePreview] = useState<string>("");

  // Initialize form data from initialData (edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        page: initialData.page || "home",
        desktopImage: initialData.desktopImageUrl || null,
        mobileImage: initialData.mobileImageUrl || null,
        button: {
          desktop: {
            text: initialData.button?.desktop?.text || "",
            url: initialData.button?.desktop?.url || "",
            color: initialData.button?.desktop?.color || "#FF6B35",
            position: initialData.button?.desktop?.position || { x: 50, y: 70 },
          },
          mobile: initialData.button?.mobile || null,
        },
        style: {
          desktop: {
            textColor: initialData.style?.desktop?.textColor || "#FFFFFF",
            overlayColor: initialData.style?.desktop?.overlayColor || "",
            textPosition: initialData.style?.desktop?.textPosition || {
              x: 50,
              y: 50,
            },
          },
          mobile: initialData.style?.mobile || null,
        },
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

  // Copy desktop settings to mobile
  const copyDesktopToMobile = (type: "button" | "style") => {
    if (type === "button") {
      setFormData((prev) => ({
        ...prev,
        button: {
          desktop: prev.button?.desktop || defaultButtonDesktop,
          mobile: { ...(prev.button?.desktop || defaultButtonDesktop) },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        style: {
          desktop: prev.style?.desktop || defaultStyleDesktop,
          mobile: { ...(prev.style?.desktop || defaultStyleDesktop) },
        },
      }));
    }
  };

  // Clear mobile settings (use desktop as fallback)
  const clearMobileSettings = (type: "button" | "style") => {
    if (type === "button") {
      setFormData((prev) => ({
        ...prev,
        button: {
          ...(prev.button || { desktop: defaultButtonDesktop }),
          mobile: undefined,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        style: {
          ...(prev.style || { desktop: defaultStyleDesktop }),
          mobile: undefined,
        },
      }));
    }
  };

  // Handle drag positioning
  const handleDragPosition = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "text" | "button"
  ) => {
    const refEl = previewInnerRef.current || previewRef.current;
    if (!refEl) return;

    const rect = refEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    // Use functional updates to avoid stale state and handle missing nested objects
    if (activeTab === "desktop") {
      if (type === "text") {
        setFormData((prev) => ({
          ...prev,
          style: {
            ...(prev.style || { desktop: defaultStyleDesktop }),
            desktop: {
              ...(prev.style?.desktop || defaultStyleDesktop),
              textPosition: { x: clampedX, y: clampedY },
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          button: {
            ...(prev.button || { desktop: defaultButtonDesktop }),
            desktop: {
              ...(prev.button?.desktop || defaultButtonDesktop),
              position: { x: clampedX, y: clampedY },
            },
          },
        }));
      }
    } else {
      // Mobile: ensure mobile objects exist (copy from desktop when missing) and update
      if (type === "button") {
        setFormData((prev) => ({
          ...prev,
          button: {
            ...(prev.button || { desktop: defaultButtonDesktop }),
            mobile: {
              // if mobile exists use it, otherwise copy desktop snapshot
              ...(prev.button?.mobile ||
                prev.button?.desktop ||
                defaultButtonDesktop),
              position: { x: clampedX, y: clampedY },
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          style: {
            ...(prev.style || { desktop: defaultStyleDesktop }),
            mobile: {
              ...(prev.style?.mobile ||
                prev.style?.desktop ||
                defaultStyleDesktop),
              textPosition: { x: clampedX, y: clampedY },
            },
          },
        }));
      }
    }
  };

  // Move handler by client coordinates (works with scaled preview)
  const handlePointerMove = (
    clientX: number,
    clientY: number,
    type: "text" | "button"
  ) => {
    const refEl = previewInnerRef.current || previewRef.current;
    if (!refEl) return;
    const rect = refEl.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (activeTab === "desktop") {
      if (type === "text") {
        setFormData((prev) => ({
          ...prev,
          style: {
            ...(prev.style || { desktop: defaultStyleDesktop }),
            desktop: {
              ...(prev.style?.desktop || defaultStyleDesktop),
              textPosition: { x: clampedX, y: clampedY },
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          button: {
            ...(prev.button || { desktop: defaultButtonDesktop }),
            desktop: {
              ...(prev.button?.desktop || defaultButtonDesktop),
              position: { x: clampedX, y: clampedY },
            },
          },
        }));
      }
    } else {
      if (type === "button") {
        setFormData((prev) => ({
          ...prev,
          button: {
            ...(prev.button || { desktop: defaultButtonDesktop }),
            mobile: {
              ...(prev.button?.mobile ||
                prev.button?.desktop ||
                defaultButtonDesktop),
              position: { x: clampedX, y: clampedY },
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          style: {
            ...(prev.style || { desktop: defaultStyleDesktop }),
            mobile: {
              ...(prev.style?.mobile ||
                prev.style?.desktop ||
                defaultStyleDesktop),
              textPosition: { x: clampedX, y: clampedY },
            },
          },
        }));
      }
    }
  };

  // Calculate canonical preview inner dimensions (px)
  const getPreviewDimensions = () => {
    const isHome = formData.page === "home";
    if (previewDevice === "mobile") {
      return { width: 768, height: isHome ? 400 : 300 };
    }
    // desktop
    return { width: 1280, height: isHome ? 600 : 400 };
  };

  // Compute scale to fit previewInner into previewOuter (so preview visual proportions remain constant)
  useEffect(() => {
    const computeScale = () => {
      const outer = previewOuterRef.current;
      const inner = previewInnerRef.current;
      if (!outer || !inner) return;
      const outerWidth = outer.clientWidth;
      const { width: innerWidth } = getPreviewDimensions();
      // Do not scale down automatically — allow horizontal scrolling when inner is wider than outer
      // This keeps canonical preview sizes unchanged and prevents layout shifts; users can scroll horizontally when needed.
      setPreviewScale(1);
    };

    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, [previewDevice, formData.page]);

  // Global pointer listeners when an element is in follow-mode
  useEffect(() => {
    if (!draggingElement) return;

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handlePointerMove(
        e.clientX,
        e.clientY,
        draggingElement as "text" | "button"
      );
    };

    const onMouseUp = () => {
      // stop following on mouseup if desired? keep following until user toggles off by clicking element again
      // We'll keep following until user toggles element or clicks in preview area (which will place and stop following)
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        handlePointerMove(
          t.clientX,
          t.clientY,
          draggingElement as "text" | "button"
        );
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove as any);
    };
  }, [draggingElement, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      // Title is optional now; no validation required for title
      if (mode === "create" && !formData.desktopImage) {
        throw new Error("Desktop image is required");
      }

      // Create FormData
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("page", formData.page);
      submitData.append("order", formData.order.toString());
      submitData.append("isActive", formData.isActive.toString());

      // Button settings
      submitData.append("button", JSON.stringify(formData.button));

      // Style settings
      submitData.append("style", JSON.stringify(formData.style));

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

  // Get current settings based on active tab (with fallback)
  const getCurrentButton = () => {
    return activeTab === "mobile" && formData.button?.mobile
      ? formData.button.mobile
      : formData.button?.desktop || defaultButtonDesktop;
  };

  const getCurrentStyle = () => {
    return activeTab === "mobile" && formData.style?.mobile
      ? formData.style.mobile
      : formData.style?.desktop || defaultStyleDesktop;
  };

  const dims = getPreviewDimensions();

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
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
              Home: 1920 x 600px | Others: 1920 x 400px
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
              Home: 768 x 400px | Others: 768 x 300px
            </p>
          </div>
        </div>

        {/* Button & Style Settings with Tabs */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="text-lg font-semibold">Button & Text Settings</h3>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "desktop" | "mobile")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="desktop">Desktop Settings</TabsTrigger>
              <TabsTrigger value="mobile">Mobile Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="desktop" className="space-y-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                <strong>Desktop settings are required.</strong> Configure button
                and text position by dragging in the preview below.
              </div>

              {/* Desktop Button Settings */}
              <div className="space-y-3">
                <h4 className="font-medium">Button Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Button Text"
                    value={formData.button?.desktop?.text ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        button: {
                          ...(prev.button || { desktop: defaultButtonDesktop }),
                          desktop: {
                            ...(prev.button?.desktop || defaultButtonDesktop),
                            text: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="Button URL"
                    value={formData.button?.desktop?.url ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        button: {
                          ...(prev.button || { desktop: defaultButtonDesktop }),
                          desktop: {
                            ...(prev.button?.desktop || defaultButtonDesktop),
                            url: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.button?.desktop?.color ?? "#FF6B35"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          button: {
                            ...(prev.button || {
                              desktop: defaultButtonDesktop,
                            }),
                            desktop: {
                              ...(prev.button?.desktop || defaultButtonDesktop),
                              color: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-20"
                    />
                    <Input
                      value={formData.button?.desktop?.color ?? "#FF6B35"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          button: {
                            ...(prev.button || {
                              desktop: defaultButtonDesktop,
                            }),
                            desktop: {
                              ...(prev.button?.desktop || defaultButtonDesktop),
                              color: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Position: X:{" "}
                    {(
                      formData.button?.desktop?.position.x ??
                      defaultButtonDesktop.position.x
                    ).toFixed(1)}
                    %, Y:{" "}
                    {(
                      formData.button?.desktop?.position.y ??
                      defaultButtonDesktop.position.y
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>

              {/* Desktop Text Style */}
              <div className="space-y-3">
                <h4 className="font-medium">Text Style</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.style?.desktop?.textColor ?? "#FFFFFF"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          style: {
                            ...(prev.style || { desktop: defaultStyleDesktop }),
                            desktop: {
                              ...(prev.style?.desktop || defaultStyleDesktop),
                              textColor: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-20"
                    />
                    <Input
                      value={formData.style?.desktop?.textColor ?? "#FFFFFF"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          style: {
                            ...(prev.style || { desktop: defaultStyleDesktop }),
                            desktop: {
                              ...(prev.style?.desktop || defaultStyleDesktop),
                              textColor: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Text Color"
                    />
                  </div>
                  <Input
                    placeholder="Overlay Color (optional)"
                    value={formData.style?.desktop?.overlayColor ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        style: {
                          ...(prev.style || { desktop: defaultStyleDesktop }),
                          desktop: {
                            ...(prev.style?.desktop || defaultStyleDesktop),
                            overlayColor: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <div className="text-sm text-gray-600">
                    Position: X:{" "}
                    {(
                      formData.style?.desktop?.textPosition.x ??
                      defaultStyleDesktop.textPosition.x
                    ).toFixed(1)}
                    %, Y:{" "}
                    {(
                      formData.style?.desktop?.textPosition.y ??
                      defaultStyleDesktop.textPosition.y
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4 mt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-900 space-y-2">
                <strong>Mobile settings are optional.</strong> If not set,
                desktop settings will be used.
                <div className="flex gap-2">
                  {!formData.button?.mobile && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => copyDesktopToMobile("button")}
                    >
                      Copy Desktop Button
                    </Button>
                  )}
                  {!formData.style?.mobile && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => copyDesktopToMobile("style")}
                    >
                      Copy Desktop Style
                    </Button>
                  )}
                  {(formData.button?.mobile || formData.style?.mobile) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        clearMobileSettings("button");
                        clearMobileSettings("style");
                      }}
                    >
                      Clear All Mobile Settings
                    </Button>
                  )}
                </div>
              </div>

              {/* Mobile Button Settings */}
              {formData.button?.mobile && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Button Settings</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => clearMobileSettings("button")}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Button Text"
                      value={formData.button?.mobile?.text ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          button: {
                            ...(prev.button || {
                              desktop: defaultButtonDesktop,
                            }),
                            mobile: {
                              ...(prev.button?.mobile || defaultButtonDesktop),
                              text: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                    <Input
                      placeholder="Button URL"
                      value={formData.button?.mobile?.url ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          button: {
                            ...(prev.button || {
                              desktop: defaultButtonDesktop,
                            }),
                            mobile: {
                              ...(prev.button?.mobile || defaultButtonDesktop),
                              url: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.button?.mobile?.color ?? "#FF6B35"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            button: {
                              ...(prev.button || {
                                desktop: defaultButtonDesktop,
                              }),
                              mobile: {
                                ...(prev.button?.mobile ||
                                  defaultButtonDesktop),
                                color: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-20"
                      />
                      <Input
                        value={formData.button?.mobile?.color ?? "#FF6B35"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            button: {
                              ...(prev.button || {
                                desktop: defaultButtonDesktop,
                              }),
                              mobile: {
                                ...(prev.button?.mobile ||
                                  defaultButtonDesktop),
                                color: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      Position: X:{" "}
                      {(
                        formData.button?.mobile?.position.x ??
                        defaultButtonDesktop.position.x
                      ).toFixed(1)}
                      %, Y:{" "}
                      {(
                        formData.button?.mobile?.position.y ??
                        defaultButtonDesktop.position.y
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Text Style */}
              {formData.style?.mobile && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Text Style</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => clearMobileSettings("style")}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.style?.mobile?.textColor ?? "#FFFFFF"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            style: {
                              ...(prev.style || {
                                desktop: defaultStyleDesktop,
                              }),
                              mobile: {
                                ...(prev.style?.mobile || defaultStyleDesktop),
                                textColor: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-20"
                      />
                      <Input
                        value={formData.style?.mobile?.textColor ?? "#FFFFFF"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            style: {
                              ...(prev.style || {
                                desktop: defaultStyleDesktop,
                              }),
                              mobile: {
                                ...(prev.style?.mobile || defaultStyleDesktop),
                                textColor: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="Text Color"
                      />
                    </div>
                    <Input
                      placeholder="Overlay Color (optional)"
                      value={formData.style?.mobile?.overlayColor ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          style: {
                            ...(prev.style || { desktop: defaultStyleDesktop }),
                            mobile: {
                              ...(prev.style?.mobile || defaultStyleDesktop),
                              overlayColor: e.target.value,
                            },
                          },
                        }))
                      }
                    />
                    <div className="text-sm text-gray-600">
                      Position: X:{" "}
                      {(
                        formData.style?.mobile?.textPosition.x ??
                        defaultStyleDesktop.textPosition.x
                      ).toFixed(1)}
                      %, Y:{" "}
                      {(
                        formData.style?.mobile?.textPosition.y ??
                        defaultStyleDesktop.textPosition.y
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
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

      {/* Draggable Preview */}
      {showPreview && (desktopPreview || mobilePreview) && (
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Interactive Preview - Drag to Position
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={previewDevice === "desktop" ? "default" : "outline"}
                onClick={() => {
                  setPreviewDevice("desktop");
                  setActiveTab("desktop");
                }}
              >
                Desktop
              </Button>
              <Button
                size="sm"
                variant={previewDevice === "mobile" ? "default" : "outline"}
                onClick={() => {
                  setPreviewDevice("mobile");
                  setActiveTab("mobile");
                }}
              >
                Mobile
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
            {formData.page === "home" ? (
              <p>
                <strong>Home Page Banner:</strong> Desktop: 600px height |
                Mobile: 400px height
              </p>
            ) : (
              <p>
                <strong>Other Pages Banner:</strong> Desktop: 400px height |
                Mobile: 300px height
              </p>
            )}
            <p className="mt-1 flex items-center gap-1">
              <Move className="w-4 h-4" />
              Click and drag text or button to reposition them
            </p>
          </div>

          <div
            ref={previewOuterRef}
            className="relative min-h-[calc(100vh-100px)] w-full overflow-x-auto overflow-y-hidden"
            style={{ height: `${dims.height * previewScale}px` }}
            onClick={(e) => {
              if (draggingElement) {
                handleDragPosition(e as any, draggingElement);
                setDraggingElement(null);
              }
            }}
          >
            {/* Inner preview has canonical width/height and is scaled to fit outer */}
            <div
              ref={previewInnerRef}
              className="relative overflow-hidden rounded-lg"
              style={{
                width: `${dims.width}px`,
                height: `${dims.height}px`,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              {/* Background image layer (matches public) */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${previewDevice === "mobile" && mobilePreview ? mobilePreview : desktopPreview})`,
                }}
              />

              {/* Overlay */}
              {getCurrentStyle().overlayColor && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: getCurrentStyle().overlayColor,
                    opacity: 0.5,
                  }}
                />
              )}

              {/* Content container (use full width in preview so percent positions map to full banner width) */}
              <div className="relative h-full w-full">
                {/* Text Content - Draggable */}
                <div
                  className="absolute max-w-3xl transform -translate-x-1/2 -translate-y-1/2 px-4 cursor-move"
                  style={{
                    left: `${getCurrentStyle().textPosition.x}%`,
                    top: `${getCurrentStyle().textPosition.y}%`,
                    border:
                      draggingElement === "text"
                        ? "2px dashed yellow"
                        : "2px dashed transparent",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDraggingElement((prev) =>
                      prev === "text" ? null : "text"
                    );
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <h2
                    className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4"
                    style={{ color: getCurrentStyle().textColor }}
                  >
                    {formData.title}
                  </h2>
                  {formData.description && (
                    <p
                      className="text-lg md:text-xl"
                      style={{ color: getCurrentStyle().textColor }}
                    >
                      {formData.description}
                    </p>
                  )}
                </div>

                {/* Button - Draggable */}
                {getCurrentButton().text && getCurrentButton().url && (
                  <div
                    style={{
                      left: `${getCurrentButton().position.x}%`,
                      top: `${getCurrentButton().position.y}%`,
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 px-4 cursor-move"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraggingElement((prev) =>
                        prev === "button" ? null : "button"
                      );
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Button
                      size="lg"
                      className="text-white font-semibold px-8 py-6"
                      style={{
                        backgroundColor: getCurrentButton().color || "#FF6B35",
                      }}
                    >
                      {getCurrentButton().text}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            {draggingElement
              ? `Click anywhere in the preview to place the ${draggingElement}`
              : "Click on text or button, then click where you want to position it"}
          </div>
        </div>
      )}
    </div>
  );
}
