import FormUser from "@/components/admin/users/form-user";
import { Button } from "@/components/ui/button";
import { getById } from "@/lib/apiService";
import { UserData } from "@/lib/types/user";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import React from "react";

interface EditUserProps {
  params: {
    id: string;
  };
}

export default async function EditUserPage({ params }: EditUserProps) {
  const { id } = await params;
  const cookiesStore = await cookies();

  const tokenValue =
    process.env.NODE_ENV === "production"
      ? cookiesStore.get("__Secure-next-auth.session-token")?.value
      : cookiesStore.get("next-auth.session-token")?.value;

  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

  console.log(process.env.NODE_ENV, "ENV");

  let user: UserData | undefined;
  let errorMessage: string | undefined;

  try {
    console.log(process.env.NEXT_PUBLIC_BASE_URL, "NEXT PUBLIC");

    // let response = await getById<UserData>(
    //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/users`,
    //   id,
    //   {
    //     headers: {
    //       cookie: `${cookieName}=${tokenValue}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${id}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let { data } = await response.json();

    user = data;
  } catch (error: any) {
    console.log(error, "INI ERROR FE");

    errorMessage = error.message || "Failed to fetch user data";
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
