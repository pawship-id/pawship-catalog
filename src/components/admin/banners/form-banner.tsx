"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BannerFormData {
  page: string;
  desktopImage: File | string | null;
  mobileImage?: File | string | null;
  button?: {
    text: string;
    url: string;
    color: string;
    position: {
      desktop: {
        horizontal: "left" | "center" | "right";
        vertical: "top" | "center" | "bottom";
      };
      mobile?: {
        horizontal: "left" | "center" | "right";
        vertical: "top" | "center" | "bottom";
      };
    };
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
  const [useButton, setUseButton] = useState(false);

  const [formData, setFormData] = useState<BannerFormData>({
    page: "home",
    desktopImage: null,
    mobileImage: undefined,
    button: undefined,
    order: 0,
    isActive: true,
  });

  const [desktopPreview, setDesktopPreview] = useState<string>("");
  const [mobilePreview, setMobilePreview] = useState<string>("");

  // Initialize form data from initialData (edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        page: initialData.page || "home",
        desktopImage: initialData.desktopImageUrl || null,
        mobileImage: initialData.mobileImageUrl || null,
        button: initialData.button || undefined,
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

      // Set useButton based on whether button data exists
      const hasButton = !!(initialData.button?.text || initialData.button?.url);
      setUseButton(hasButton);
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
      if (mode === "create" && !formData.desktopImage) {
        throw new Error("Desktop image is required");
      }

      if (useButton) {
        if (!formData.button?.text || !formData.button?.url) {
          throw new Error(
            "Button text and URL are required when button is enabled"
          );
        }
        if (
          !formData.button?.position?.desktop?.horizontal ||
          !formData.button?.position?.desktop?.vertical
        ) {
          throw new Error(
            "Desktop button position is required when button is enabled"
          );
        }
      }

      // Create FormData
      const submitData = new FormData();

      submitData.append("page", formData.page);
      submitData.append("order", formData.order.toString());
      submitData.append("isActive", formData.isActive.toString());

      // Only include button if useButton is enabled
      if (useButton && formData.button) {
        submitData.append("button", JSON.stringify(formData.button));
      } else if (mode === "edit") {
        submitData.append("removeButton", "true");
      }

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

  // Get button position classes
  const getButtonPositionClasses = (device: "desktop" | "mobile") => {
    const position =
      device === "mobile" && formData.button?.position?.mobile
        ? formData.button.position.mobile
        : formData.button?.position?.desktop;

    if (!position) return "justify-center items-center";

    const horizontalMap = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };

    const verticalMap = {
      top: "items-start",
      center: "items-center",
      bottom: "items-end",
    };

    return `${horizontalMap[position.horizontal]} ${verticalMap[position.vertical]}`;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {/* Info Alert */}
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="space-y-2">
            <div>
              <strong className="text-blue-900">
                Recommended Image Sizes:
              </strong>
              <div className="mt-1 space-y-2">
                <div className="text-sm">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-1">
                    Desktop
                  </span>
                  {formData.page === "home"
                    ? "1920 × 1080px (16:9)"
                    : "1920 × 650px (~3:1)"}{" "}
                  • Max 2MB • Displays at ≥ 768px width
                </div>
                <div className="text-sm">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                    Mobile
                  </span>
                  {formData.page === "home"
                    ? "720 × 1280px (9:16)"
                    : "768 × 400px (1.92:1)"}{" "}
                  • Max 1MB • Displays at &lt; 768px width
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              <strong>Format:</strong> JPG, PNG, WebP
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="desktopImage"
              className="text-base font-medium text-gray-700"
            >
              Desktop Image <span className="text-red-500">*</span>
            </Label>
          </div>
          <Input
            id="desktopImage"
            type="file"
            accept="image/*"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
            onChange={handleDesktopImageChange}
          />
          {desktopPreview && (
            <img
              src={desktopPreview}
              alt="Desktop Preview"
              className="w-full max-w-2xl h-48 object-cover rounded-lg border mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="mobileImage"
              className="text-base font-medium text-gray-700"
            >
              Mobile Image (Optional)
            </Label>
          </div>
          <Input
            id="mobileImage"
            type="file"
            accept="image/*"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="page"
              className="text-base font-medium text-gray-700"
            >
              Page <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.page}
              onValueChange={(value) =>
                setFormData({ ...formData, page: value })
              }
            >
              <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full">
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
                <SelectItem value="faq">FAQ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="order"
              className="text-base font-medium text-gray-700"
            >
              Order <span className="text-red-500">*</span>
            </Label>
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
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            />
            <p className="text-sm text-gray-500">
              Lower number = higher priority
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
            className="data-[state=unchecked]:bg-gray-200"
          />
          <Label htmlFor="isActive">Active (Display on website)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="useButton"
            checked={useButton}
            onCheckedChange={(checked) => {
              setUseButton(checked);
              if (!checked) {
                setFormData({ ...formData, button: undefined });
              } else {
                setFormData({
                  ...formData,
                  button: {
                    text: "",
                    url: "",
                    color: "#FF6B35",
                    position: {
                      desktop: {
                        horizontal: "center",
                        vertical: "bottom",
                      },
                    },
                  },
                });
              }
            }}
            className="data-[state=unchecked]:bg-gray-200"
          />
          <Label htmlFor="useButton">Add Button (CTA)</Label>
        </div>

        {/* Button Settings */}
        {useButton && (
          <div className="space-y-4 border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-white">
            <h3 className="text-lg font-semibold text-orange-900">
              Button Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button-text">
                  Button Text <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="button-text"
                  placeholder="e.g., Shop Now"
                  maxLength={30}
                  value={formData.button?.text || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      button: {
                        ...(formData.button || {
                          text: "",
                          url: "",
                          color: "#FF6B35",
                          position: {
                            desktop: {
                              horizontal: "center",
                              vertical: "bottom",
                            },
                          },
                        }),
                        text: e.target.value,
                      },
                    })
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                />
                <p className="text-xs text-gray-500">Max 15 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="button-url">
                  Button URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="button-url"
                  placeholder="/catalog"
                  value={formData.button?.url || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      button: {
                        ...(formData.button || {
                          text: "",
                          url: "",
                          color: "#FF6B35",
                          position: {
                            desktop: {
                              horizontal: "center",
                              vertical: "bottom",
                            },
                          },
                        }),
                        url: e.target.value,
                      },
                    })
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                />
              </div>

              <div className="space-y-2">
                <Label>Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.button?.color || "#FF6B35"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        button: {
                          ...(formData.button || {
                            text: "",
                            url: "",
                            color: "#FF6B35",
                            position: {
                              desktop: {
                                horizontal: "center",
                                vertical: "bottom",
                              },
                            },
                          }),
                          color: e.target.value,
                        },
                      })
                    }
                    className="w-20 border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  />
                  <Input
                    value={formData.button?.color || "#FF6B35"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        button: {
                          ...(formData.button || {
                            text: "",
                            url: "",
                            color: "#FF6B35",
                            position: {
                              desktop: {
                                horizontal: "center",
                                vertical: "bottom",
                              },
                            },
                          }),
                          color: e.target.value,
                        },
                      })
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Position */}
            <div className="space-y-3 pt-3 border-t">
              <h4 className="font-medium">
                Desktop Position <span className="text-red-500">*</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horizontal</Label>
                  <Select
                    value={
                      formData.button?.position?.desktop?.horizontal || "center"
                    }
                    onValueChange={(value: any) =>
                      setFormData({
                        ...formData,
                        button: {
                          ...(formData.button || {
                            text: "",
                            url: "",
                            color: "#FF6B35",
                            position: {
                              desktop: {
                                horizontal: "center",
                                vertical: "bottom",
                              },
                            },
                          }),
                          position: {
                            ...(formData.button?.position || {
                              desktop: {
                                horizontal: "center",
                                vertical: "bottom",
                              },
                            }),
                            desktop: {
                              ...(formData.button?.position?.desktop || {
                                horizontal: "center",
                                vertical: "bottom",
                              }),
                              horizontal: value,
                            },
                          },
                        },
                      })
                    }
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Vertical</Label>
                  <Select
                    value={
                      formData.button?.position?.desktop?.vertical || "bottom"
                    }
                    onValueChange={(value: any) =>
                      setFormData({
                        ...formData,
                        button: {
                          ...(formData.button || {
                            text: "",
                            url: "",
                            color: "#FF6B35",
                            position: {
                              desktop: {
                                horizontal: "center",
                                vertical: "bottom",
                              },
                            },
                          }),
                          position: {
                            ...(formData.button?.position || {
                              desktop: {
                                horizontal: "center",
                                vertical: "bottom",
                              },
                            }),
                            desktop: {
                              ...(formData.button?.position?.desktop || {
                                horizontal: "center",
                                vertical: "bottom",
                              }),
                              vertical: value,
                            },
                          },
                        },
                      })
                    }
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Mobile Position */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Mobile Position (Optional)</h4>
                {formData.button?.position?.mobile ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        button: {
                          ...formData.button!,
                          position: {
                            ...formData.button!.position,
                            mobile: undefined,
                          },
                        },
                      })
                    }
                    className="text-red-600"
                  >
                    Clear Mobile
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        button: {
                          ...formData.button!,
                          position: {
                            ...formData.button!.position,
                            mobile: {
                              ...formData.button!.position.desktop,
                            },
                          },
                        },
                      })
                    }
                  >
                    Copy from Desktop
                  </Button>
                )}
              </div>

              {formData.button?.position?.mobile ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horizontal</Label>
                    <Select
                      value={formData.button.position.mobile.horizontal}
                      onValueChange={(value: any) =>
                        setFormData({
                          ...formData,
                          button: {
                            ...formData.button!,
                            position: {
                              ...formData.button!.position,
                              mobile: {
                                ...formData.button!.position.mobile!,
                                horizontal: value,
                              },
                            },
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-full border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Vertical</Label>
                    <Select
                      value={formData.button.position.mobile.vertical}
                      onValueChange={(value: any) =>
                        setFormData({
                          ...formData,
                          button: {
                            ...formData.button!,
                            position: {
                              ...formData.button!.position,
                              mobile: {
                                ...formData.button!.position.mobile!,
                                vertical: value,
                              },
                            },
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-full border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-2">
                  Using desktop position for mobile
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}{" "}
            Banner
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
