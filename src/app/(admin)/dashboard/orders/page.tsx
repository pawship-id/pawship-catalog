"use client";
import React, { useEffect, useState } from "react";
import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";
import TableOrder from "@/components/admin/orders/table-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAll } from "@/lib/apiService";
import { OrderData } from "@/lib/types/order";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";

export default function OrderPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filteredDataOrder, setFilteredDataOrder] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState({
    orderType: "all",
    status: "all",
  });

  const [loadingUpdateStatus, setLoadingUpdateStatus] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

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
        // Combine filtering by status and orderType (tab)
        let filteredOrder = response.data;

        // Filter by status if not "all"
        if (selectedFilter.status !== "all") {
          filteredOrder = filteredOrder.filter(
            (order: OrderData) => order.status === selectedFilter.status
          );
        }

        // Filter by orderType if not "all"
        if (selectedFilter.orderType !== "all") {
          filteredOrder = filteredOrder.filter(
            (order: OrderData) => order.orderType === selectedFilter.orderType
          );
        }
        setFilteredDataOrder(filteredOrder);

        setOrders(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    status: OrderData["status"]
  ) => {
    setLoadingUpdateStatus(true);

    try {
      const response = await fetch(
        `/api/admin/orders/update-status/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
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
      (o) => o.status === "pending confirmation"
    ).length;

    return { total, totalB2C, totalB2B, pending };
  };

  const stats = getOrderStats();

  useEffect(() => {
    fetchOrders();
  }, [selectedFilter]);

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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search order..."
                    className="pl-10 border-1 border-border focus:border-primary w-full"
                  />
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
