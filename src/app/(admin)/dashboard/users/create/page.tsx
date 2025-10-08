import FormUser from "@/components/admin/users/form-user";
import React from "react";

export default function CreateUserPage() {
  return (
    <div className="p-6 min-h-screen">
      <div className="mb-6 space-y-2  mx-4 md:mx-10">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Add User
        </h1>
        <p className="text-muted-foreground">View and manage all users</p>
      </div>

      <FormUser />
    </div>
  );
}
