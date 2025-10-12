"use client";
import FormUser from "@/components/admin/users/form-user";
import { getById } from "@/lib/apiService";
import { UserData } from "@/lib/types/user";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Error from "@/components/error";

export default function EditUserPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchUserById = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<UserData>("/api/admin/users", id);

      if (response.data) {
        setUser(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserById();
  }, [id]);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Edit User
        </h1>
        <p className="text-muted-foreground text-lg">Edit User Data</p>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
          <p className="mt-1 text-sm text-gray-500">Please wait a moment.</p>
        </div>
      ) : error ? (
        <Error errorMessage={error} url="/dashboard/users" />
      ) : (
        <FormUser initialData={user} userId={id} />
      )}
    </div>
  );
}
