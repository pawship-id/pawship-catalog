"use client";
import React, { useEffect, useState } from "react";
import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";
import TableOrder from "@/components/admin/orders/table-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAll } from "@/lib/apiService";
import { OrderData } from "@/lib/types/order";
import { Search, X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import Link from "next/link";

export default function OrderPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filteredDataOrder, setFilteredDataOrder] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFilter, setSelectedFilter] = useState({
    orderType: "all",
    status: "all",
  });

  const [loadingUpdateStatus, setLoadingUpdateStatus] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

  const countries = [
    { country: "Indonesia", code: "ID" },
    { country: "Singapore", code: "SG" },
    { country: "Malaysia", code: "MY" },
    { country: "Thailand", code: "TH" },
    { country: "Philippines", code: "PH" },
    { country: "Vietnam", code: "VN" },
    { country: "Hong Kong", code: "HK" },
    { country: "China", code: "CN" },
    { country: "Japan", code: "JP" },
    { country: "South Korea", code: "KR" },
    { country: "Australia", code: "AU" },
    { country: "New Zealand", code: "NZ" },
    { country: "United States", code: "US" },
    { country: "United Kingdom", code: "UK" },
    { country: "Canada", code: "CA" },
  ];

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);

    setSelectedFilter((prev) => ({
      ...prev,
      orderType: tabValue,
    }));
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<OrderData>("/api/admin/orders");

      // Filter response data by orderType and status if selectedFilter is not "all"
      if (response.data?.length) {
        setOrders(response.data);
        applyFilters(response.data, selectedFilter, searchQuery);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    data: OrderData[],
    filters: typeof selectedFilter,
    search: string,
  ) => {
    let filtered = [...data];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    // Filter by orderType (tab)
    if (filters.orderType !== "all") {
      filtered = filtered.filter(
        (order) => order.orderType === filters.orderType,
      );
    }

    // Filter by search query
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        // Search by order ID (invoice number)
        const matchOrderId = order.invoiceNumber?.toLowerCase().includes(query);

        // Search by customer name
        const matchName = order.shippingAddress?.fullName
          ?.toLowerCase()
          .includes(query);

        // Search by phone number
        const matchPhone = order.shippingAddress?.phone
          ?.toLowerCase()
          .includes(query);

        // Search by product name or variant name in order details
        const matchProduct = order.orderDetails?.some(
          (detail) =>
            detail.productName?.toLowerCase().includes(query) ||
            detail.variantName?.toLowerCase().includes(query),
        );

        return matchOrderId || matchName || matchPhone || matchProduct;
      });
    }

    setFilteredDataOrder(filtered);
  };

  const handleUpdateStatus = async (
    orderId: string,
    status: OrderData["status"],
  ) => {
    setLoadingUpdateStatus(true);

    try {
      const response = await fetch(
        `/api/admin/orders/update-status/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || "Internal server error");
      }

      await fetchOrders();

      let result = await response.json();
      showSuccessAlert("Success", result.message);
    } catch (error: any) {
      showErrorAlert(undefined, error.message);
    } finally {
      setLoadingUpdateStatus(false);
    }
  };

  const getOrderStats = () => {
    const total = orders.length;
    const totalB2C = orders.filter((o) => o.orderType === "B2C").length;
    const totalB2B = orders.filter((o) => o.orderType === "B2B").length;
    const pending = orders.filter(
      (o) => o.status === "pending confirmation",
    ).length;

    return { total, totalB2C, totalB2B, pending };
  };

  const stats = getOrderStats();

  useEffect(() => {
    fetchOrders();
  }, [selectedFilter]);

  // Apply filters when search query changes
  useEffect(() => {
    if (orders.length > 0) {
      applyFilters(orders, selectedFilter, searchQuery);
    }
  }, [searchQuery]);

  if (error) {
    return <ErrorPage errorMessage={error} url="/dashboard" />;
  }

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Order Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage and track orders from retail and reseller customers
        </p>
      </div>

      {loading ? (
        <LoadingPage text="Loading fetch orders..." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-l-4 border-primary shadow-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-l-4 border-blue-600 shadow-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Retail Orders
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats.totalB2C}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-l-4 border-green-600 shadow-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Reseller Orders
              </p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats.totalB2B}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-l-4 border-orange-600 shadow-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending Orders
              </p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {stats.pending}
              </p>
            </div>
          </div>

          <div className="mb-4 mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <Select
                  value={selectedFilter.status}
                  onValueChange={(value) =>
                    setSelectedFilter((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="w-48 border-1 border-border focus:border-primary">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending confirmation">
                      Pending Confirmation
                    </SelectItem>
                    <SelectItem value="awaiting payment">
                      Awaiting Payment
                    </SelectItem>
                    <SelectItem value="payment confirmed">
                      Payment Confirmed
                    </SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                  </SelectContent>
                </Select>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground">
                    Found {filteredDataOrder.length} result
                    {filteredDataOrder.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild>
                  <Link href="/dashboard/orders/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Order
                  </Link>
                </Button>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, order ID, or product..."
                    className="pl-10 pr-10 border-1 border-border focus:border-primary w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Tabs
            onValueChange={handleTabChange}
            defaultValue="all"
            value={activeTab}
            className="w-full"
          >
            <TabsList className="flex w-full justify-start space-x-8 p-0 bg-transparent border-b border-gray-200 dark:border-gray-700">
              <TabsTrigger
                value="all"
                className="data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-primary data-[state=active]:text-primary text-gray-500 font-semibold rounded-t-lg px-4 py-3 transition-all duration-200 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                All Orders ({stats.total})
              </TabsTrigger>

              <TabsTrigger
                value="B2C"
                className="data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 text-gray-500 font-semibold rounded-t-lg px-4 py-3 transition-all duration-200 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Retail Orders ({stats.totalB2C})
              </TabsTrigger>

              <TabsTrigger
                value="B2B"
                className="data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-green-600 data-[state=active]:text-green-600 text-gray-500 font-semibold rounded-t-lg px-4 py-3 transition-all duration-200 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Reseller Orders ({stats.totalB2B})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <TableOrder
                onUpdateStatus={handleUpdateStatus}
                isLoading={loadingUpdateStatus}
                orders={filteredDataOrder}
              />
            </TabsContent>

            <TabsContent value="B2C" className="mt-4">
              <TableOrder
                onUpdateStatus={handleUpdateStatus}
                isLoading={loadingUpdateStatus}
                orders={filteredDataOrder}
              />
            </TabsContent>

            <TabsContent value="B2B" className="mt-4">
              <TableOrder
                onUpdateStatus={handleUpdateStatus}
                isLoading={loadingUpdateStatus}
                orders={filteredDataOrder}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
