"use client";

import Sidebar from "@/components/admin/sidebar";
import { SessionProvider } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 min-h-screen mx-4">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
