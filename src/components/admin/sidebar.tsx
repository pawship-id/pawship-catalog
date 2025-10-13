"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  LogOut,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { showConfirmAlert } from "@/lib/helpers/sweetalert2";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Categories", href: "/dashboard/categories", icon: FolderTree },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Website", href: "/", icon: Globe },
];

export default function Sidebar() {
  const handleSignOut = async () => {
    const result = await showConfirmAlert(
      "You will be logged out of your account",
      "Yes, logout!"
    );

    if (result.isConfirmed) {
      await signOut({ callbackUrl: "/login" });
    }
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  // hook to detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        // md breakpoint
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // check when first load
    checkScreenSize();

    // add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const initials = user?.fullName
    .split(" ")
    .map((n: any) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Overlay for mobile when sidebar is expanded */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <div
        className={cn(
          "bg-sidebar border-r border-sidebar-border md:transition-all md:duration-300 h-full z-50",
          // Desktop: relative positioning, mobile: fixed positioning
          // "md:relative fixed left-0 top-0",
          isCollapsed ? "w-16" : "w-64 md:relative fixed left-0 top-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {!isCollapsed && (
              <div className="flex items-center justify-center w-full">
                <Link href="/">
                  <img
                    src="/images/transparent-logo-2.png"
                    alt="Pawship Logo"
                    className="h-10 w-auto"
                  />
                </Link>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isCollapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* User Info */}
          {!isCollapsed && user && (
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-sidebar-primary-foreground">
                    {initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => {
                    // Auto close sidebar on mobile when navigation item is clicked
                    if (window.innerWidth < 768) {
                      setIsCollapsed(true);
                    }
                  }}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="flex items-center gap-2">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
