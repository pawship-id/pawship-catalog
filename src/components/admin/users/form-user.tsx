"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { useRouter } from "next/navigation";
import { createData, updateData } from "@/lib/apiService";
import { UserData, UserForm } from "@/lib/types/user";
import { ApiResponse } from "@/lib/types/api";

interface UserFormProps {
  initialData?: any;
  userId?: string;
}

const initialFormState: UserForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  role: "retail",
  password: "",
  confirmPassword: "",
};

export default function FormUser({ initialData, userId }: UserFormProps) {
  const [formData, setFormData] = useState<UserForm>(
    initialData || initialFormState
  );
  const [loading, setLoading] = useState(false);
  const isEditMode = !!userId;
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response: ApiResponse<UserData>;

      if (!isEditMode) {
        response = await createData<UserData, UserForm>("/api/users", formData);
      } else {
        response = await updateData<UserData, UserForm>(
          "/api/users",
          userId,
          formData
        );
      }

      showSuccessAlert(undefined, response.message);

      router.push("/dashboard/users");
    } catch (err: any) {
      showErrorAlert(undefined, err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        role: initialData.role || "retail",
      });
    }
  }, [initialData]);

  return (
    <form
      className="space-y-2 md:space-y-4"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            className="text-base font-medium text-gray-700"
          >
            Full Name *
          </Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-5"
            required
            autoFocus
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-base font-medium text-gray-700"
          >
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-5"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-base font-medium text-gray-700"
          >
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter phone number"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-5"
            required
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-base font-medium text-gray-700">
            Role *
          </Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
            required
          >
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-5 w-full">
              <SelectValue placeholder="Select user role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="reseller">Reseller</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {!isEditMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-base font-medium text-gray-700"
            >
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-5"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-base font-medium text-gray-700"
            >
              Confirm Password *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-5"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button type="submit" className="px-6 w-full sm:w-auto">
          {loading ? "Loading..." : isEditMode ? "Update User" : "Create User"}
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
