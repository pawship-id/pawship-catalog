"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  CreditCard,
  CheckCircle,
  Truck,
  PackageCheck,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { showErrorAlert } from "@/lib/helpers/sweetalert2";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface DashboardStats {
  totalProducts: number;
  totalRevenue: number;
  ordersByStatus: {
    pending_confirmation: number;
    paid: number;
    processing: number;
    shipped: number;
  };
  totalOrders: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month, year, custom
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  console.log(stats);

  useEffect(() => {
    // Only fetch if custom filter and both dates are selected, or if not custom filter
    if (dateFilter === "custom") {
      if (dateRange.from && dateRange.to) {
        fetchDashboardStats();
      }
    } else {
      fetchDashboardStats();
    }
  }, [dateFilter, dateRange.from, dateRange.to]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/dashboard/stats?filter=${dateFilter}`;

      // Add date range params if custom filter is selected
      if (dateFilter === "custom" && dateRange.from && dateRange.to) {
        url += `&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showErrorAlert(
        "Error",
        error.message || "Failed to fetch dashboard stats"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      case "custom":
        if (dateRange.from && dateRange.to) {
          return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
        }
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  const clearCustomDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
    setDateFilter("all");
  };

  const orderStatusCards = [
    {
      status: "pending_confirmation",
      title: "Pending Confirmation",
      icon: Clock,
      color: "text-yellow-600",
      borderColor: "border-yellow-600",
      route: "/dashboard/orders?status=pending_confirmation",
    },
    {
      status: "paid",
      title: "Paid",
      icon: CheckCircle,
      color: "text-blue-600",
      borderColor: "border-blue-600",
      route: "/dashboard/orders?status=paid",
    },
    {
      status: "processing",
      title: "Processing",
      icon: CreditCard,
      color: "text-orange-600",
      borderColor: "border-orange-600",
      route: "/dashboard/orders?status=processing",
    },
    {
      status: "shipped",
      title: "Shipped",
      icon: Truck,
      color: "text-green-600",
      borderColor: "border-green-600",
      route: "/dashboard/orders?status=shipped",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome to your Pawship CMS admin dashboard
        </p>
      </div>

      {/* Date Filter Controls - Diposisikan di bawah header */}
      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center gap-3">
        <span className="text-base font-medium text-gray-700 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Filter Data:
        </span>

        {/* Quick Filter Dropdown */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Select
            value={dateFilter}
            onValueChange={(value) => {
              setDateFilter(value);
              if (value !== "custom") {
                setDateRange({ from: undefined, to: undefined });
              }
            }}
          >
            <SelectTrigger className="w-full lg:w-[150px] border-gray-300 bg-white hover:border-gray-400">
              <SelectValue placeholder="Pilih Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Inputs (shown when custom is selected) */}
        {dateFilter === "custom" && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-2 w-full lg:w-auto mt-2 lg:mt-0">
            {/* Start Date Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 sr-only">
                Start Date
              </label>
              <input
                type="date"
                value={
                  dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""
                }
                onChange={(e) => {
                  const newDate = e.target.value
                    ? new Date(e.target.value + "T00:00:00")
                    : undefined;
                  setDateRange((prev) => ({ ...prev, from: newDate }));
                }}
                max={format(new Date(), "yyyy-MM-dd")}
                className="w-full sm:w-[150px] h-10 px-3 text-sm rounded-md border border-gray-300 bg-white hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Start Date"
                title="Start Date"
              />
            </div>

            <span className="self-center hidden sm:inline-block text-gray-500">
              -
            </span>

            {/* End Date Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 sr-only">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const newDate = e.target.value
                    ? new Date(e.target.value + "T23:59:59")
                    : undefined;
                  setDateRange((prev) => ({ ...prev, to: newDate }));
                }}
                min={
                  dateRange.from
                    ? format(dateRange.from, "yyyy-MM-dd")
                    : undefined
                }
                max={format(new Date(), "yyyy-MM-dd")}
                className="w-full sm:w-[150px] h-10 px-3 text-sm rounded-md border border-gray-300 bg-white hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500"
                placeholder="End Date"
                title="End Date"
              />
            </div>

            {/* Clear button */}
            {(dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearCustomDateRange}
                className="h-10 w-full sm:w-10 hover:bg-red-100 hover:text-red-600 transition-colors"
                title="Clear dates"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Custom Date Range Summary Banner */}
      {dateFilter === "custom" && dateRange.from && dateRange.to && (
        <Card className="mb-10 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-blue-900">
                    Custom Date Range Summary
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Showing data from{" "}
                    <span className="font-semibold">
                      {format(dateRange.from, "MMMM dd, yyyy")}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {format(dateRange.to, "MMMM dd, yyyy")}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1">
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </div>
                <p className="text-sm text-blue-700">
                  Revenue from {stats?.totalOrders || 0} orders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 min-[570px]:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Revenue */}
        <div
          className="bg-white dark:bg-gray-800 p-5 rounded-lg border-l-4 border-green-600 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/dashboard/orders")}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-900 dark:text-green-400">
              Total Revenue
            </p>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-white mt-1">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 mt-2">
            {getDateFilterLabel()}
          </p>
        </div>

        {/* Total Orders */}
        <div
          className="bg-white dark:bg-gray-800 p-5 rounded-lg border-l-4 border-blue-600 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/dashboard/orders")}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
              Total Orders
            </p>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900 dark:text-white mt-1">
            {stats?.totalOrders || 0}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
            {getDateFilterLabel()}
          </p>
        </div>

        {/* Total Products */}
        <div
          className="bg-white dark:bg-gray-800 p-5 rounded-lg border-l-4 border-purple-600 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/dashboard/products")}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-400">
              Total Products
            </p>
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900 dark:text-white mt-1">
            {stats?.totalProducts || 0}
          </p>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-2">
            Active products
          </p>
        </div>
      </div>

      {/* Orders by Status */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>
        <div className="grid grid-cols-1 min-[570px]:grid-cols-2 lg:grid-cols-4 gap-4">
          {orderStatusCards.map((item) => {
            const count =
              stats?.ordersByStatus[
                item.status as keyof typeof stats.ordersByStatus
              ] || 0;

            return (
              <div
                key={item.status}
                className={`bg-white dark:bg-gray-800 p-5 rounded-lg border-l-4 ${item.borderColor} shadow-md cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => router.push(item.route)}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-medium ${item.color} dark:${item.color.replace("text-", "text-").replace("-600", "-400")}`}
                  >
                    {item.title}
                  </p>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p
                  className={`text-3xl font-bold ${item.color} dark:text-white mt-1`}
                >
                  {count}
                </p>
                <p
                  className={`text-xs ${item.color} dark:${item.color.replace("text-", "text-").replace("-600", "-400")} opacity-70 mt-2`}
                >
                  {getDateFilterLabel()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
        <p>Frequently used actions for managing your store</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2 cursor-pointer shadow-md hover:shadow-none rounded-lg"
            onClick={() => router.push("/dashboard/products/create")}
          >
            <Package className="h-5 w-5" />
            <span className="text-sm">Add Product</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2 cursor-pointer shadow-md hover:shadow-none rounded-lg"
            onClick={() => router.push("/dashboard/orders")}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm">View Orders</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2 cursor-pointer shadow-md hover:shadow-none rounded-lg"
            onClick={() => router.push("/dashboard/stocks")}
          >
            <Package className="h-5 w-5" />
            <span className="text-sm">Manage Stock</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2 cursor-pointer shadow-md hover:shadow-none rounded-lg"
            onClick={() => router.push("/dashboard/categories")}
          >
            <Package className="h-5 w-5" />
            <span className="text-sm">Categories</span>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <Card className="bg-white shadow-md border">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions for managing your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push("/dashboard/products/create")}
            >
              <Package className="h-5 w-5" />
              <span className="text-sm">Add Product</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push("/dashboard/orders")}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm">View Orders</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push("/dashboard/stocks")}
            >
              <Package className="h-5 w-5" />
              <span className="text-sm">Manage Stock</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => router.push("/dashboard/categories")}
            >
              <Package className="h-5 w-5" />
              <span className="text-sm">Categories</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
