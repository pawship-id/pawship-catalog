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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName || ""}
                onChange={(e) =>
                  handleInputChange("businessName", e.target.value)
                }
                placeholder="Enter business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={formData.businessType || ""}
                onValueChange={(value) =>
                  handleInputChange("businessType", value)
                }
              >
                <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.socialMedia?.instagram || ""}
                onChange={(e) =>
                  handleNestedChange("socialMedia", "instagram", e.target.value)
                }
                placeholder="@username or URL"
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
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.shippingAddress?.address || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "shippingAddress",
                    "address",
                    e.target.value
                  )
                }
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.shippingAddress?.city || ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "shippingAddress",
                      "city",
                      e.target.value
                    )
                  }
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
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
                />
              </div>

              <div className="space-y-2">
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
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internal Remarks */}
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (For Internal Use)</Label>
              <Textarea
                id="remarks"
                value={formData.remarks || ""}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder="Add internal notes about this reseller"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="cursor-pointer">
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    );
  }

  // Retail Profile Form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address?.address || ""}
              onChange={(e) =>
                handleNestedChange("address", "address", e.target.value)
              }
              placeholder="Enter complete address"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.address?.country || ""}
                onChange={(e) =>
                  handleNestedChange("address", "country", e.target.value)
                }
                placeholder="Enter country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.address?.city || ""}
                onChange={(e) =>
                  handleNestedChange("address", "city", e.target.value)
                }
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.address?.district || ""}
                onChange={(e) =>
                  handleNestedChange("address", "district", e.target.value)
                }
                placeholder="Enter district"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.address?.zipCode || ""}
                onChange={(e) =>
                  handleNestedChange("address", "zipCode", e.target.value)
                }
                placeholder="Enter zip code"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internal Remarks */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (For Internal Use)</Label>
            <Textarea
              id="remarks"
              value={formData.remarks || ""}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              placeholder="Add internal notes about this customer"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="cursor-pointer">
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
