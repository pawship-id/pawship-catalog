"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ChevronRight, Clock, CheckCircle, Truck } from "lucide-react";
import Image from "next/image";

interface OrderItem {
  _id: string;
  invoiceNumber: string;
  orderDate: string;
  totalAmount: number;
  status: "pending confirmation" | "paid" | "processing" | "shipped";
  orderDetails: Array<{
    productName: string;
    quantity: number;
    image: {
      imageUrl: string;
    };
  }>;
  currency: string;
}

const statusConfig = {
  "pending confirmation": {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
  },
  paid: {
    label: "Paid",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
  },
  processing: {
    label: "Processing",
    icon: Package,
    color: "text-blue-600 bg-blue-50",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-purple-600 bg-purple-50",
  },
};

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url =
        activeTab === "all"
          ? "/api/public/orders/my-orders"
          : `/api/public/orders/my-orders?status=${activeTab}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    const currencies: { [key: string]: string } = {
      IDR: "Rp",
      USD: "$",
      SGD: "S$",
      HKD: "HK$",
    };
    const symbol = currencies[currency] || currency;
    return `${symbol} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending confirmation">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-2">
                  No orders found
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeTab === "all"
                    ? "You haven't placed any orders yet"
                    : `No orders with status "${statusConfig[activeTab as keyof typeof statusConfig]?.label}"`}
                </p>
                <Link href="/catalog">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              return (
                <Card
                  key={order._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Order Date: {formatDate(order.orderDate)}
                        </p>
                        <p className="font-semibold text-lg">
                          {order.invoiceNumber}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                          statusConfig[order.status].color
                        }`}
                      >
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-b py-4 mb-4">
                      {order.orderDetails.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex gap-3 mb-3 last:mb-0">
                          <div className="relative w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image.imageUrl}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium line-clamp-1">
                              {item.productName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.orderDetails.length > 2 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          +{order.orderDetails.length - 2} more items
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="text-xl font-bold">
                          {formatPrice(order.totalAmount, order.currency)}
                        </p>
                      </div>
                      <Link href={`/my-orders/${order._id}`}>
                        <Button variant="outline" className="gap-2">
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
