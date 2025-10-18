"use client";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { ActionResult } from "@/lib/types";
import { useActionState, useEffect, useState } from "react";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { redirect } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";

const initialState: ActionResult = {
  status: "",
  message: "",
  formData: {
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
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
      {pending ? "Loading..." : "Create"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state.status === "error") {
      showErrorAlert("Registration Failed", state.message);
    } else if (state.status === "success") {
      showSuccessAlert("Registration Successful", state.message);

      setTimeout(() => {
        redirect("/login");
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
          <h1 className="text-2xl sm:text-3xl font-normal mb-6 sm:mb-8 text-black">
            Create account
          </h1>

          <div className="w-full space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              autoFocus
              name="fullName"
              defaultValue={state.formData.fullName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
            <div>
              <input
                type="text"
                placeholder="Phone Number"
                name="phoneNumber"
                defaultValue={state.formData.phoneNumber}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
              />
              <small className="text-gray-500 text-xs mt-2 block">
                Please start the phone number with the country code, for
                example: +62
              </small>
            </div>
            <input
              type="email"
              placeholder="Email"
              name="email"
              defaultValue={state.formData.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                defaultValue={state.formData.password}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                defaultValue={state.formData.confirmPassword}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <SubmitButton />
          <Link
            href="/login"
            className="text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 hover:underline"
          >
            Already have an account? Log in here
          </Link>
        </form>
      </div>
    </div>
  );
}
