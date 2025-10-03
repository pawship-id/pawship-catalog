import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/helpers";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // if the user is already logged in and tries to access the login page, redirect to the homepage
  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // if the user tries to access the admin page
  if (pathname.startsWith("/dashboard/admin")) {
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
  matcher: ["/login", "/dashboard/admin/:path*"],
};
