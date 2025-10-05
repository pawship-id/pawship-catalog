"use client";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";

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
      {pending ? "Loading..." : "Send Email"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordAction, null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const msg = searchParams.get("msg");
    if (msg) {
      showErrorAlert(undefined, msg);
    }
  }, [searchParams]);

  useEffect(() => {
    if (state?.status === "error") {
      showErrorAlert(undefined, state.message);
    } else if (state?.status === "success") {
      showSuccessAlert(undefined, state.message);

      setTimeout(() => {
        redirect("/forgot-password");
      }, 2000);
    }
  }, [state]);

  return (
    <div className="bg-gray-100 flex items-center justify-center py-25 font-sans">
      <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24">
        <form
          action={formAction}
          autoComplete="off"
          className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-lg mx-auto flex flex-col items-center"
        >
          <h1 className="text-2xl sm:text-3xl font-normal mb-4 text-black">
            Forgot Password
          </h1>
          <p className="mb-6 sm:mb-8">
            We will send you an email to reset your password
          </p>
          <div className="w-full space-y-4">
            <input
              type="email"
              placeholder="Email"
              autoFocus
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
          </div>
          <SubmitButton />
          <Link
            href="/login"
            className="text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 hover:underline"
          >
            Cancel
          </Link>
        </form>
      </div>
    </div>
  );
}
