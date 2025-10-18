import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/helpers";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // if the user has not logged in
  if (!token) {
    if (pathname.startsWith("/wishlist") || pathname.startsWith("/cart")) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${pathname}`, req.url)
      );
    }
  }

  // if the user is already logged in and tries to access the login page, redirect to the homepage
  if (token) {
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // if the user tries to access the admin page
  if (pathname.startsWith("/dashboard")) {
    // if there is no token (not logged in), redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // if there is a token but it is not admin, redirect to homepage (or another page)
    if (token && !isAdmin(token.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/wishlist",
    "/cart",
    "/dashboard/:path*",
  ],
};
