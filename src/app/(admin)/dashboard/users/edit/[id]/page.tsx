"use client";
import FormUser from "@/components/admin/users/form-user";
import { Button } from "@/components/ui/button";
import { getById } from "@/lib/apiService";
import { UserData } from "@/lib/types/user";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";

export default function EditUserPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<UserData | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userData = await getById<UserData>("/api/users", id);

        setUser(userData.data);
        setErrorMessage(undefined);
      } catch (error: any) {
        console.log(error, "INI ERROR FE");
        setErrorMessage(error.message || "Failed to fetch user data");
        setUser(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Edit User
        </h1>
        <p className="text-muted-foreground text-lg">Edit User Data</p>
      </div>

      {errorMessage ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-xl border border-gray-100">
            <div className="text-center space-y-8 max-w-lg">
              {/* Logo */}
              <div className="mx-auto w-25 h-25 bg-muted rounded-full flex items-center justify-center">
                <TriangleAlert className="w-15 h-15 text-red-600" />
              </div>

              {/* Error Message */}
              <div className="space-y-3">
                <h1 className="text-3xl font-playfair font-bold text-foreground">
                  Error
                </h1>
                <p className="text-xl text-muted-foreground px-4">
                  {errorMessage}
                </p>
              </div>

              {/* Back Button */}
              <Button
                variant="outline"
                size="lg"
                asChild
                className="inline-flex items-center gap-2 py-6 cursor-pointer border-foreground/20 text-foreground hover:bg-foreground hover:text-background"
              >
                <Link href="/dashboard/users">
                  <ArrowLeft className="w-7 h-7" />
                  Back to Previous Page
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <FormUser initialData={user} userId={id} />
      )}
    </div>
  );
}
