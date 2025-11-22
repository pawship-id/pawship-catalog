"use client";
import React, { useState } from "react";
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
import { IResellerProfile, IRetailProfile } from "@/lib/models/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ProfileFormProps {
  userId: string;
  role: "reseller" | "retail";
  initialData?: IResellerProfile | IRetailProfile;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function ProfileForm({
  userId,
  role,
  initialData,
  onSubmit,
  isLoading,
}: ProfileFormProps) {
  const [formData, setFormData] = useState<any>(
    initialData ||
      (role === "reseller"
        ? getEmptyResellerProfile()
        : getEmptyRetailProfile())
  );

  function getEmptyResellerProfile(): IResellerProfile {
    return {
      businessName: "",
      businessType: undefined,
      socialMedia: {
        instagram: "",
        youtube: "",
        tiktok: "",
      },
      shippingAddress: {
        address: "",
        country: "",
        city: "",
        district: "",
        zipCode: "",
      },
      taxLegalInfo: "",
      remarks: "",
    };
  }

  function getEmptyRetailProfile(): IRetailProfile {
    return {
      address: {
        address: "",
        country: "",
        city: "",
        district: "",
        zipCode: "",
      },
      remarks: "",
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  if (role === "reseller") {
    return (
      <form
        autoComplete="off"
        onSubmit={handleSubmit}
        className="space-y-2 md:space-y-4"
      >
        {/* Business Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="businessName"
              className="text-base font-medium text-gray-700"
            >
              Business Name
            </Label>
            <Input
              id="businessName"
              value={formData.businessName || ""}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
              placeholder="Enter business name"
              autoFocus
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="businessType"
              className="text-base font-medium text-gray-700"
            >
              Business Type
            </Label>
            <Select
              value={formData.businessType || ""}
              onValueChange={(value) =>
                handleInputChange("businessType", value)
              }
            >
              <SelectTrigger className="w-full border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offline shop">Offline Shop</SelectItem>
                <SelectItem value="online store">Online Store</SelectItem>
                <SelectItem value="groomer">Groomer</SelectItem>
                <SelectItem value="reseller">Reseller</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-3">
          <Label
            htmlFor="social media"
            className="text-base font-medium text-gray-700"
          >
            Social Media
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.socialMedia?.instagram || ""}
                onChange={(e) =>
                  handleNestedChange("socialMedia", "instagram", e.target.value)
                }
                placeholder="@username or URL"
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={formData.socialMedia?.youtube || ""}
                onChange={(e) =>
                  handleNestedChange("socialMedia", "youtube", e.target.value)
                }
                placeholder="Channel URL"
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={formData.socialMedia?.tiktok || ""}
                onChange={(e) =>
                  handleNestedChange("socialMedia", "tiktok", e.target.value)
                }
                placeholder="@username or URL"
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-3">
          <Label
            htmlFor="social media"
            className="text-base font-medium text-gray-700"
          >
            Shipping Address
          </Label>
          <div className="space-y-3">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.shippingAddress?.address || ""}
              onChange={(e) =>
                handleNestedChange("shippingAddress", "address", e.target.value)
              }
              placeholder="Enter complete address"
              rows={3}
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.shippingAddress?.country || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "shippingAddress",
                    "country",
                    e.target.value
                  )
                }
                placeholder="Enter country"
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.shippingAddress?.city || ""}
                onChange={(e) =>
                  handleNestedChange("shippingAddress", "city", e.target.value)
                }
                placeholder="Enter city"
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.shippingAddress?.district || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "shippingAddress",
                    "district",
                    e.target.value
                  )
                }
                placeholder="Enter district"
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.shippingAddress?.zipCode || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "shippingAddress",
                    "zipCode",
                    e.target.value
                  )
                }
                placeholder="Enter zip code"
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              />
            </div>
          </div>
        </div>

        {/* Internal Remarks */}
        <div className="space-y-3">
          <Label
            htmlFor="social media"
            className="text-base font-medium text-gray-700"
          >
            Internal Notes
          </Label>
          <div className="space-y-3">
            <Label htmlFor="remarks">Remarks (For Internal Use)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks || ""}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="Add internal notes about this reseller"
              rows={4}
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            type="submit"
            className="px-6 w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Update Profile"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="px-6 w-full sm:w-auto"
            asChild
          >
            <Link href="/dashboard/users">Cancel</Link>
          </Button>
        </div>
      </form>
    );
  }

  // Retail Profile Form
  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="space-y-2 md:space-y-4"
    >
      {/* Address */}
      <div className="space-y-3">
        <Label
          htmlFor="social media"
          className="text-base font-medium text-gray-700"
        >
          Shipping Address
        </Label>
        <div className="space-y-3">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address?.address || ""}
            onChange={(e) =>
              handleNestedChange("address", "address", e.target.value)
            }
            placeholder="Enter complete address"
            rows={3}
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.address?.country || ""}
              onChange={(e) =>
                handleNestedChange("address", "country", e.target.value)
              }
              placeholder="Enter country"
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.address?.city || ""}
              onChange={(e) =>
                handleNestedChange("address", "city", e.target.value)
              }
              placeholder="Enter city"
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={formData.address?.district || ""}
              onChange={(e) =>
                handleNestedChange("address", "district", e.target.value)
              }
              placeholder="Enter district"
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              value={formData.address?.zipCode || ""}
              onChange={(e) =>
                handleNestedChange("address", "zipCode", e.target.value)
              }
              placeholder="Enter zip code"
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            />
          </div>
        </div>
      </div>

      {/* Internal Remarks */}
      <div className="space-y-3">
        <Label
          htmlFor="social media"
          className="text-base font-medium text-gray-700"
        >
          Internal Notes
        </Label>
        <div className="space-y-3">
          <Label htmlFor="remarks">Remarks (For Internal Use)</Label>
          <Textarea
            id="remarks"
            value={formData.remarks || ""}
            onChange={(e) => handleInputChange("remarks", e.target.value)}
            placeholder="Add internal notes about this customer"
            rows={4}
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          type="submit"
          className="px-6 w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Update Profile"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="px-6 w-full sm:w-auto"
          asChild
        >
          <Link href="/dashboard/users">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
