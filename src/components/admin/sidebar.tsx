"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FolderTree,
  ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Warehouse,
  Megaphone,
  Puzzle,
  PackageCheck,
  ChevronDown,
} from "lucide-react";
import { useSession } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Categories", href: "/dashboard/categories", icon: FolderTree },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Stock", href: "/dashboard/stock", icon: PackageCheck },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Content", href: "/dashboard/content", icon: ImageIcon },
  { name: "Users", href: "/dashboard/users", icon: Users, adminOnly: true },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    placeholder: true,
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: Warehouse,
    placeholder: true,
  },
  {
    name: "Marketing",
    href: "/dashboard/marketing",
    icon: Megaphone,
    placeholder: true,
  },
  {
    name: "Integrations",
    href: "/dashboard/integrations",
    icon: Puzzle,
    placeholder: true,
  },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.fullName
    .split(" ")
    .map((n: any) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || user?.role === "Admin"
  );

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <img
                src="/images/transparent-logo-2.png"
                alt="Pawship Logo"
                className="h-10 w-auto"
              />
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
          {filteredNavigation.map((item) => {
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
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="flex items-center gap-2">
                    {item.name}
                    {item.placeholder && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Expandable Menu Section */}
        <div className="p-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <Settings className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  <span className="ml-3">Management</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 ml-auto transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </>
              )}
            </Button>

            {isExpanded && !isCollapsed && (
              <div className="ml-7 space-y-1">
                <Link
                  href="/dashboard/reports"
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === "/dashboard/reports"
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span>Reports</span>
                </Link>
                <Link
                  href="/dashboard/permissions"
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === "/dashboard/permissions"
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span>Permissions</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            // onClick={logout}
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
  );
}
