"use client";

import React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // get search params
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // get callbackUrl

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    if (!email) {
      return showErrorAlert("Error", "Please input an email");
    }

    if (!password) {
      return showErrorAlert("Error", "Please input a password");
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
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
              type="email"
              placeholder="Email"
              autoFocus
              name="email"
              defaultValue="adminpawship@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              defaultValue="qwerty123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
          </div>
          <Link
            href="/forgot-password"
            className="text-xs sm:text-sm text-gray-600 mt-2 mb-4 sm:mb-6 self-start hover:underline"
          >
            Forgot your password?
          </Link>
          <button className="w-full px-4 py-3 bg-primary/90 hover:bg-primary text-white font-bold rounded-md  transition-colors duration-200 text-base sm:text-lg cursor-pointer">
            Sign in
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
