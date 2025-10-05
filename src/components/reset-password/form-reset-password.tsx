"use client";
import React, { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { resetPasswordAction } from "@/lib/actions/auth";
import { ActionResult } from "@/lib/types";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { redirect } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const initialState: ActionResult = {
  status: "",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className={`w-full px-4 py-3 text-white font-bold rounded-md transition-colors duration-200 text-base sm:text-lg mt-4 sm:mt-6 ${
        pending
          ? "bg-primary/60 cursor-not-allowed"
          : "bg-primary/90 hover:bg-primary cursor-pointer"
      }`}
    >
      {pending ? "Loading..." : "Reset Password"}
    </button>
  );
}

export default function FormResetPassword({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const [newPassword, setNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);

  useEffect(() => {
    if (state.status === "error") {
      showErrorAlert(undefined, state.message);
    } else if (state.status === "success") {
      showSuccessAlert(undefined, state.message);

      setTimeout(() => {
        redirect("/login");
      }, 2000);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      autoComplete="off"
      className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-lg mx-auto flex flex-col items-center"
    >
      <h1 className="text-2xl sm:text-3xl font-normal mb-4 text-black ">
        Reset Your Password
      </h1>
      <p className="mb-6 sm:mb-8">Enter your new password</p>
      <div className="w-full space-y-4">
        <input type="hidden" name="token" value={token} />

        <div className="relative">
          <input
            autoFocus
            type={newPassword ? "text" : "password"}
            placeholder="New Password"
            name="newPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setNewPassword(!newPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {newPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        <div className="relative">
          <input
            type={confirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            name="confirmPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setConfirmPassword(!confirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {confirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      <SubmitButton />
      <Link
        href="/forgot-password"
        className="text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 hover:underline"
      >
        Cancel
      </Link>
    </form>
  );
}
