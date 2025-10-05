"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // get search params
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // get callbackUrl
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);

    const form = new FormData(e.currentTarget);

    const identifier = form.get("identifier");

    const password = form.get("password");

    if (!identifier) {
      setIsLoading(false);

      return showErrorAlert("Error", "Please input an email or username");
    }

    if (!password) {
      setIsLoading(false);

      return showErrorAlert("Error", "Please input a password");
    }

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    if (res?.error) {
      setIsLoading(false);

      return showErrorAlert("Error", res.error);
    }

    const response = await fetch("/api/auth/session");

    const data = await response.json();

    const role = data?.user?.role;

    showSuccessAlert("Login Successful", "Redirecting...");

    setTimeout(() => {
      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/");
      }

      setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center py-25 font-sans">
      <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24">
        <form
          autoComplete="off"
          onSubmit={handleLogin}
          className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg w-full max-w-lg mx-auto flex flex-col items-center"
        >
          <h1 className="text-2xl sm:text-3xl font-normal mb-6 sm:mb-8 text-black">
            Login
          </h1>

          <div className="w-full space-y-4">
            <input
              type="text"
              autoFocus
              placeholder="Email or Username"
              name="identifier"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
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
          </div>
          <Link
            href="/forgot-password"
            className="text-xs sm:text-sm text-gray-600 mt-2 mb-4 sm:mb-6 self-start hover:underline"
          >
            Forgot your password?
          </Link>
          <button
            className={`w-full px-4 py-3 text-white font-bold rounded-md transition-colors duration-200 text-base sm:text-lg ${
              isLoading
                ? "bg-primary/60 cursor-not-allowed"
                : "bg-primary/90 hover:bg-primary cursor-pointer"
            }`}
          >
            {isLoading ? "Loading..." : "Sign in"}
          </button>
          <Link
            href="/register"
            className="text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 hover:underline"
          >
            Create account
          </Link>
        </form>
      </div>
    </div>
  );
}
