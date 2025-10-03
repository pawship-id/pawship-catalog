"use client";
import Link from "next/link";
import { register } from "@/lib/actions/auth";
import { ActionResult } from "@/lib/types";
import { useActionState, useEffect } from "react";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { redirect } from "next/navigation";

const initialState: ActionResult = {
  status: "",
  message: "",
};

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, initialState);

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
              type="email"
              placeholder="Email"
              autoFocus
              name="email"
              defaultValue="salwa@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              defaultValue="qwerty123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              defaultValue="qwerty123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
            />
          </div>
          <button className="w-full px-4 py-3 bg-primary/90 hover:bg-primary text-white font-bold rounded-md  transition-colors duration-200 text-base sm:text-lg mt-4 sm:mt-6 cursor-pointer">
            Create
          </button>
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
