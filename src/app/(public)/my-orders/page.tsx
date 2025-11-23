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
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  _id: string;
  invoiceNumber: string;
  orderDate: string;
  totalAmount: number;
  status:
    | "pending confirmation"
    | "awaiting payment"
    | "payment confirmed"
    | "processing"
    | "shipped";
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
      </div>
    </div>
  );
}
