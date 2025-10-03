"use server";

import User from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";
import sendEmail from "@/lib/helpers/sendEmail";
import { ActionResult } from "../types";
import { headers } from "next/headers";

export async function register(
  _: unknown,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        status: "error",
        message: "Email already exists",
      };
    }

    const newUser = new User({
      email,
      password, // hash process in the model
      confirmPassword,
    });

    await newUser.save();
    return { status: "success", message: "You can now log in." };
  } catch (error: any) {
    console.log(error, "register function /lib/actions/auth.ts");

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return { status: "error", message: errors };
    } else {
      return { status: "error", message: "Something went wrong" };
    }
  }
}

export async function forgotPasswordAction(
  _: unknown,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;

  console.log(email);
  if (!email) {
    return { status: "error", message: "Please input an email" };
  }

  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) {
    return {
      status: "error",
      message: "User not found",
    };
  }

  try {
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const resetUrl = `${protocol}://${host}/reset-password/${resetToken}`;

    const message = `Silakan klik link berikut untuk mereset password Anda: ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Reset Password Anda",
      message: message,
    });

    return {
      status: "success",
      message:
        "Successfully sent password reset token, please check your email.",
    };
  } catch (error: any) {
    console.log(error, "forgot password function /lib/actions/auth.ts");

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return {
      status: "error",
      message: "Failed to send email. Please try again.",
    };
  }
}
