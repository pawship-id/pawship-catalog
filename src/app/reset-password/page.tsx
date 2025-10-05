import React from "react";
import { validateResetToken } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import FormResetPassword from "@/components/reset-password/form-reset-password";

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/forgot-password");
  }

  const isValid = await validateResetToken(token);

  if (!isValid) {
    redirect("/forgot-password?msg=The link is invalid or has expired");
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center py-25 font-sans">
      <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24">
        <FormResetPassword token={token} />
      </div>
    </div>
  );
}
