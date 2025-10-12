import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Suspense } from "react";
import LoadingPage from "@/components/admin/loading-page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pawship CMS Admin Dashboard",
  description: "Modern CMS Admin Dashboard for Pawship",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[9999] bg-white bg-opacity-95 flex items-center justify-center">
              <LoadingPage />
            </div>
          }
        >
          {children}
        </Suspense>
      </body>
    </html>
  );
}
