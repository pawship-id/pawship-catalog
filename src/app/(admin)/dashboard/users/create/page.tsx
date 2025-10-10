import FormUser from "@/components/admin/users/form-user";
import React from "react";

export default function CreateUserPage() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Add User
        </h1>
        <p className="text-muted-foreground text-lg">Create New User</p>
      </div>

      <FormUser />
    </div>
  );
}
