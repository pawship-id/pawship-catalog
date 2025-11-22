"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  ChevronDown,
  Save,
  Lock,
  Mail,
  Phone,
  Building2,
  Globe,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import Link from "next/link";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  accountType: "B2C" | "B2B";
  businessName?: string;
  businessType?: string;
  taxId?: string;
  address?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    zipCode: string;
    country: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Change Password States
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Helper function to update profile fields
  const updateProfile = (field: keyof UserProfile, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  // Helper function to update address fields
  const updateAddress = (field: string, value: string) => {
    if (profile) {
      setProfile({
        ...profile,
        address: {
          fullName: profile.address?.fullName || "",
          phone: profile.address?.phone || "",
          address: profile.address?.address || "",
          city: profile.address?.city || "",
          district: profile.address?.district || "",
          zipCode: profile.address?.zipCode || "",
          country: profile.address?.country || "Indonesia",
          ...profile.address,
          [field]: value,
        },
      });
    }
  };

  // Helper function to update password data
  const updatePasswordData = (
    field: keyof typeof passwordData,
    value: string
  ) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/public/profile");
      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/public/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const result = await response.json();

      if (result.success) {
        showSuccessAlert(undefined, "Profile updated successfully!");
      } else {
        showErrorAlert(undefined, result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorAlert(undefined, "An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirmation do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/public/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowChangePassword(false);
      } else {
        alert(result.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("An error occurred while changing password");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile and account settings
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Profile Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {profile.accountType === "B2B"
                  ? "Business Information"
                  : "Personal Information"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {profile.accountType === "B2B"
                      ? "Contact Person Name"
                      : "Full Name"}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={profile.name || ""}
                      onChange={(e) => updateProfile("name", e.target.value)}
                      className="pl-10 border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile.phone || ""}
                      onChange={(e) => updateProfile("phone", e.target.value)}
                      className="pl-10 border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      className="pl-10 bg-muted border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contact admin to change email
                  </p>
                </div>

                {/* Account Type */}
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Input
                    value={profile.accountType}
                    className="bg-muted border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Account type cannot be changed
                  </p>
                </div>
              </div>

              {/* B2B Specific Fields */}
              {profile.accountType === "B2B" && (
                <>
                  <Separator className="my-6" />
                  <h3 className="text-lg font-semibold mb-4">
                    Business Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="businessName"
                          value={profile.businessName || ""}
                          onChange={(e) =>
                            updateProfile("businessName", e.target.value)
                          }
                          className="pl-10 border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={profile.businessType || ""}
                        onValueChange={(value) =>
                          updateProfile("businessType", value)
                        }
                      >
                        <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 w-full">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="distributor">
                            Distributor
                          </SelectItem>
                          <SelectItem value="online-store">
                            Online Store
                          </SelectItem>
                          <SelectItem value="pet-shop">Pet Shop</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxId">
                        Tax ID / Business Registration
                      </Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="taxId"
                          value={profile.taxId || ""}
                          onChange={(e) =>
                            updateProfile("taxId", e.target.value)
                          }
                          className="pl-10 border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Separator className="my-6" />

            {/* Shipping Address Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="addressStreet">Street Address</Label>
                  <Textarea
                    id="addressStreet"
                    value={profile.address?.address || ""}
                    onChange={(e) => updateAddress("address", e.target.value)}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 rounded-md p-2 w-full"
                  />
                </div>

                {/* District */}
                <div className="space-y-2">
                  <Label htmlFor="addressDistrict">District</Label>
                  <Input
                    id="addressDistrict"
                    value={profile.address?.district || ""}
                    onChange={(e) => updateAddress("district", e.target.value)}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="addressCity">City</Label>
                  <Input
                    id="addressCity"
                    value={profile.address?.city || ""}
                    onChange={(e) => updateAddress("city", e.target.value)}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  />
                </div>

                {/* Zip Code */}
                <div className="space-y-2">
                  <Label htmlFor="addressZipCode">Zip Code</Label>
                  <Input
                    id="addressZipCode"
                    value={profile.address?.zipCode || ""}
                    onChange={(e) => updateAddress("zipCode", e.target.value)}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="addressCountry">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="addressCountry"
                      value={profile.address?.country || "Indonesia"}
                      onChange={(e) => updateAddress("country", e.target.value)}
                      className="pl-10 border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                className="px-6 w-full sm:w-auto"
                asChild
              >
                <Link href="/">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      updatePasswordData("currentPassword", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      updatePasswordData("newPassword", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      updatePasswordData("confirmPassword", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
