"use server";

import User, { IUser } from "@/lib/models/User";
import dbConnect from "@/lib/mongodb";
import sendEmail from "@/lib/helpers/sendEmail";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { ActionResult } from "../types";
import { headers } from "next/headers";

// register to create user by default retail role
export async function registerAction(
  _: unknown,
  formData: FormData
): Promise<ActionResult> {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  try {
    await dbConnect();

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return {
        status: "error",
        message: "Username already exists.",
        formData: { username, email, password, confirmPassword },
      };
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return {
        status: "error",
        message: "Email already exists.",
        formData: { username, email, password, confirmPassword },
      };
    }

    const newUser = new User({
      username,
      email,
      password, // hash process in the model
      confirmPassword,
    });

    await newUser.save();
    return {
      status: "success",
      message: "You can now log in.",
      formData: { username, email, password, confirmPassword },
    };
  } catch (error: any) {
    console.log(error, "register function /lib/actions/auth.ts");

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return {
        status: "error",
        message: errors,
        formData: { username, email, password, confirmPassword },
      };
    } else if (error.name === "MongooseError") {
      return {
        status: "error",
        message: error.message,
        formData: { username, email, password, confirmPassword },
      };
    } else {
      return {
        status: "error",
        message: "Something went wrong",
        formData: { username, email, password, confirmPassword },
      };
    }
  }
}

// forgot password to send email (token)
export async function forgotPasswordAction(
  _: unknown,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;

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
    const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}`;

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

// validate reset token to validate token valid or invalid
export async function validateResetToken(token: string): Promise<IUser | null> {
  if (!token) {
    return null;
  }

  await dbConnect();

  const hashedReceivedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const findUserByToken = await User.findOne({
    passwordResetToken: hashedReceivedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  return findUserByToken;
}

// reset password action to update password
export async function resetPasswordAction(
  _: unknown,
  formData: FormData
): Promise<ActionResult> {
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  console.log(token, newPassword, confirmPassword);

  if (!newPassword) {
    return { status: "error", message: "Please input a password" };
  }

  if (!confirmPassword) {
    return { status: "error", message: "Please input a confirm password" };
  }

  if (newPassword !== confirmPassword) {
    return { status: "error", message: "Passwords do not match" };
  }

  try {
    const findUserByToken = await validateResetToken(token);

    if (!findUserByToken || !findUserByToken._id) {
      return {
        status: "error",
        message: "The link is invalid or has expired.",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(findUserByToken._id, {
      password: hashedPassword,
      passwordResetToken: "",
      passwordResetExpires: "",
    });

    return {
      status: "success",
      message: "Password changed successfully, You can now log in",
    };
  } catch (error) {
    console.error("Failed to reset password:", error);
    return {
      status: "error",
      message: "Failed to change password. Please try again.",
    };
  }
}
