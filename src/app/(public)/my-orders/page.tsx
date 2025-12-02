"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { OrderData } from "@/lib/types/order";
import { currencyFormat } from "@/lib/helpers";

const statusConfig = {
  "pending confirmation": {
    label: "Pending Confirmation",
    icon: Clock,
    color: "text-orange-600 bg-orange-50",
    description:
      "We're reviewing your order and calculating shipping.\nOur team will message you on WhatsApp shortly with your final total.",
  },
  "awaiting payment": {
    label: "Awaiting Payment",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
    description:
      "Your total has been confirmed. Please complete your payment and upload your proof here.",
  },
  "payment confirmed": {
    label: "Payment Confirmed",
    icon: CheckCircle,
    color: "text-blue-600 bg-blue-50",
    description: "Thank you! Your payment has been verified.",
  },
  processing: {
    label: "Processing",
    icon: Package,
    color: "text-purple-600 bg-purple-50",
    description: "Your order is being packed with love 💛",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-green-600 bg-green-50",
    description: "Your order is on the way! Tracking number: XXXX",
  },
};

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [productSlugs, setProductSlugs] = useState<{
    [productId: string]: string;
  }>({});

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

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
        // Fetch latest slugs for all products
        await fetchProductSlugs(result.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSlugs = async (ordersData: OrderData[]) => {
    try {
      // Collect all unique product IDs from all orders
      const productIds = new Set<string>();
      ordersData.forEach((order) => {
        order.orderDetails.forEach((item) => {
          if (item.productId) {
            productIds.add(item.productId);
          }
        });
      });

      // Fetch all products in parallel
      const slugsMap: { [productId: string]: string } = {};

      await Promise.all(
        Array.from(productIds).map(async (productId) => {
          try {
            const response = await fetch(`/api/public/products/${productId}`);
            const result = await response.json();

            if (result.success && result.data) {
              // Use slug if available, otherwise fallback to productId
              slugsMap[productId] = result.data.slug || productId;
            } else {
              slugsMap[productId] = productId;
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            slugsMap[productId] = productId;
          }
        })
      );

      setProductSlugs(slugsMap);
    } catch (error) {
      console.error("Error fetching product slugs:", error);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>

        <div className="flex items-center gap-2">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[220px] border-gray-300 focus:border-primary/80 focus:ring-primary/80 flex items-center justify-between pr-2 py-5 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending confirmation">
                Pending Confirmation
              </SelectItem>
              <SelectItem value="awaiting payment">Awaiting Payment</SelectItem>
              <SelectItem value="payment confirmed">
                Payment Confirmed
              </SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
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
            const isExpanded = expandedOrders.has(order._id);
            const hasMoreItems = order.orderDetails.length > 3;
            const displayedItems = isExpanded
              ? order.orderDetails
              : order.orderDetails.slice(0, 3);

            return (
              <Card
                key={order._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        Order Date: {formatDate(String(order.orderDate))}
                      </p>
                      <p className="font-semibold text-sm sm:text-lg truncate">
                        {order.invoiceNumber}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${
                        statusConfig[order.status].color
                      } self-start shrink-0`}
                    >
                      <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                        {statusConfig[order.status].label}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-b py-3 sm:py-4 mb-3 sm:mb-4">
                    {displayedItems.map((item, index) => {
                      const productSlug =
                        productSlugs[item.productId] || item.productId;

                      return (
                        <div
                          key={index}
                          className="flex gap-2 sm:gap-3 mb-2 sm:mb-3 last:mb-0"
                        >
                          <Link
                            href={`/product/${productSlug}`}
                            className="block flex-shrink-0"
                          >
                            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded border overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                              <Image
                                src={item.image.imageUrl}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${productSlug}`}
                              className="hover:text-primary transition-colors block"
                            >
                              <p className="font-medium text-sm sm:text-base line-clamp-2">
                                {item.productName}
                              </p>
                            </Link>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {hasMoreItems && (
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="flex items-center gap-1 text-xs sm:text-sm text-primary hover:text-primary/80 font-medium mt-2 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            Show {order.orderDetails.length - 3} More Items
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-lg sm:text-xl font-bold">
                        {currencyFormat(
                          order.totalAmount +
                            (order.shippingCost - order.discountShipping),
                          order.currency
                        )}
                      </p>
                    </div>
                    <Link
                      href={`/my-orders/${order._id}`}
                      className="self-start sm:self-auto"
                    >
                      <Button
                        variant="outline"
                        className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4"
                      >
                        View Details
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
