"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileForm from "@/components/admin/users/profile-form";
import { getById } from "@/lib/apiService";
import { UserData } from "@/lib/types/user";
import LoadingPage from "@/components/loading";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import ErrorPage from "@/components/admin/error-page";

export default function UpdateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getById<UserData>("/api/admin/users", userId);
      if (response.data) {
        setUser(response.data);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (profileData: any) => {
    try {
      setIsSubmitting(true);

      const payload =
        user?.role === "reseller"
          ? { resellerProfile: profileData }
          : { retailProfile: profileData };

      const response = await fetch(`/api/admin/users/${userId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        showSuccessAlert(
          "Success",
          result.message || "Profile updated successfully"
        );
        router.push("/dashboard/users");
      } else {
        showErrorAlert("Error", result.message || "Failed to update profile");
      }
    } catch (error: any) {
      showErrorAlert("Error", error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  //   if (loading) {
  //     return <LoadingPage />;
  //   }

  //   if (!user) {
  //     return (
  //       <div className="p-8 text-center">
  //         <p className="text-red-500">User not found</p>
  //       </div>
  //     );
  //   }

  //   if (user.role === "admin") {
  //     return (
  //       <div className="p-8 text-center">
  //         <p className="text-gray-600">Admin users do not have profiles</p>
  //         <Button
  //           onClick={() => router.push("/dashboard/users")}
  //           className="mt-4 cursor-pointer"
  //         >
  //           Back to Users
  //         </Button>
  //       </div>
  //     );
  //   }

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Update Profile
        </h1>
        <p className="text-muted-foreground text-lg">
          Update user profile data
        </p>
      </div>

      {loading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/users" />
      ) : (
        <ProfileForm
          userId={userId}
          role={user?.role as "reseller" | "retail"}
          initialData={
            user?.role === "reseller"
              ? user?.resellerProfile
              : user?.retailProfile
          }
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
