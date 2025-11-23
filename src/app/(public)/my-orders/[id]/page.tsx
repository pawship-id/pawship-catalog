"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  Upload,
  Hourglass,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { UploadPaymentProofModal } from "@/components/orders/upload-payment-proof-modal";
import { PaymentProofDetailModal } from "@/components/orders/payment-proof-detail-modal";

interface PaymentProof {
  imageUrl: string;
  imagePublicId: string;
  note?: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface OrderDetail {
  _id: string;
  userId: string;
  invoiceNumber: string;
  orderDate: string;
  totalAmount: number;
  shippingCost: number;
  status:
    | "pending confirmation"
    | "awaiting payment"
    | "payment confirmed"
    | "processing"
    | "shipped";
  currency: string;
  orderType: "B2C" | "B2B";
  paymentProofs: PaymentProof[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    city: string;
    district: string;
    zipCode: string;
  };
  orderDetails: Array<{
    productId: string;
    productName: string;
    variantName: string;
    quantity: number;
    originalPrice: { [key: string]: number };
    discountedPrice?: { [key: string]: number };
    subTotal: number;
    image: {
      imageUrl: string;
      imagePublicId: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
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
    description: "Your order is on the way!",
  },
};

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [showProofDetail, setShowProofDetail] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && params.id) {
      fetchOrderDetail();
    }
  }, [status, params.id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/orders/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.message || "Failed to fetch order");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("An error occurred while fetching order details");
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProductPrice = (item: OrderDetail["orderDetails"][0]) => {
    const currency = order?.currency || "IDR";
    if (item.discountedPrice && item.discountedPrice[currency]) {
      return item.discountedPrice[currency];
    }
    return item.originalPrice[currency];
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

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">
              {error || "Order not found"}
            </p>
            <Link href="/my-orders">
              <Button>Back to My Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status].icon;
  const subtotal = order.totalAmount - order.shippingCost;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/my-orders">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      {/* Order Status */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-full ${
                    statusConfig[order.status].color
                  }`}
                >
                  <StatusIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {statusConfig[order.status].label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {statusConfig[order.status].description}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-semibold text-lg">{order.invoiceNumber}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(order.orderDate)}
              </p>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-muted -z-10">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width:
                      order.status === "pending confirmation"
                        ? "0%"
                        : order.status === "awaiting payment"
                          ? "25%"
                          : order.status === "payment confirmed"
                            ? "50%"
                            : order.status === "processing"
                              ? "75%"
                              : "100%",
                  }}
                ></div>
              </div>

              {/* Timeline Steps */}
              {Object.entries(statusConfig).map(([key, config], index) => {
                const statusOrder = [
                  "pending confirmation",
                  "awaiting payment",
                  "payment confirmed",
                  "processing",
                  "shipped",
                ];
                const currentIndex = statusOrder.indexOf(order.status);
                const stepIndex = statusOrder.indexOf(key);

                const isCompleted = stepIndex < currentIndex;
                const isCurrent = key === order.status;

                return (
                  <div key={key} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        isCompleted || isCurrent
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <config.icon className="h-4 w-4" />
                    </div>
                    <p
                      className={`text-xs text-center ${
                        isCompleted || isCurrent
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {config.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Products */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderDetails.map((item, index) => (
                  <div key={index}>
                    <div className="flex gap-4">
                      <div className="relative w-25 h-25 rounded-lg border overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-800 mb-1">
                          {item.productName}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          Variant: {item.variantName}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col space-y-0.5">
                            {item.discountedPrice &&
                            item.discountedPrice[order.currency] ? (
                              <>
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-base font-bold text-orange-600">
                                    {formatPrice(
                                      item.discountedPrice[order.currency],
                                      order.currency
                                    )}
                                  </span>
                                  {item.originalPrice[order.currency] &&
                                    item.discountedPrice[order.currency] && (
                                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                                        -
                                        {Math.round(
                                          ((item.originalPrice[order.currency] -
                                            item.discountedPrice[
                                              order.currency
                                            ]) /
                                            item.originalPrice[
                                              order.currency
                                            ]) *
                                            100
                                        )}
                                        %
                                      </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(
                                    item.originalPrice[order.currency],
                                    order.currency
                                  )}
                                </span>
                              </>
                            ) : (
                              <span className="text-base font-bold text-gray-800">
                                {formatPrice(
                                  item.originalPrice[order.currency],
                                  order.currency
                                )}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            x{item.quantity}
                          </div>
                        </div>
                        <div className="flex flex-col min-[380px]:flex-row justify-between items-start md:items-center mt-3 pt-2 border-t border-gray-250">
                          <span className="text-sm font-semibold text-gray-700">
                            Subtotal
                          </span>
                          <span className="text-base font-bold text-primary">
                            {formatPrice(item.subTotal, order.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < order.orderDetails.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.phone}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.email}
              </p>
              <Separator className="my-2" />
              <p className="text-muted-foreground">
                {order.shippingAddress.address}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.district}, {order.shippingAddress.city}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.country}, {order.shippingAddress.zipCode}
              </p>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping Cost</span>
                <span>{formatPrice(order.shippingCost, order.currency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(order.totalAmount, order.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {order.status !== "pending confirmation" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {order.status === "awaiting payment" ? (
                    <>
                      <Hourglass className="h-5 w-5" />
                      Confirmation Payment
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5" />
                      Payment Proofs ({order.paymentProofs.length})
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                {/* Payment proof upload / display area */}
                {order && (
                  <div>
                    {order.status === "awaiting payment" && (
                      <div className="space-y-4 mb-5">
                        <p className="text-sm">
                          Already transferred? Upload your payment proof here.
                          We’ll confirm your order shortly.
                        </p>
                        <Button
                          onClick={() => setShowUploadModal(true)}
                          className="gap-2"
                          size="sm"
                        >
                          <Upload className="h-4 w-4" />
                          Upload payment proof
                        </Button>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `Halo, saya sudah melakukan pembayaran untuk pesanan ${order.invoiceNumber}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md shadow-md transition-all duration-300"
                          >
                            <img
                              src="/images/icon-wa.png"
                              className="w-5 h-5"
                              alt="WhatsApp Icon"
                            />
                            <span className="text-sm font-medium">
                              Chat via WhatsApp
                            </span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Display existing proofs */}
                    {order.paymentProofs && order.paymentProofs.length > 0 && (
                      <div className="space-y-3">
                        {order.status === "awaiting payment" && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between pt-2">
                              <h4 className="text-base font-semibold text-gray-900">
                                Payment Proofs ({order.paymentProofs.length})
                              </h4>
                            </div>
                          </>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {order.paymentProofs.map((proof, index) => (
                            <div
                              key={index}
                              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
                              onClick={() => {
                                setSelectedProof(proof);
                                setShowProofDetail(true);
                              }}
                            >
                              <img
                                src={proof.imageUrl}
                                alt={`Payment proof ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {params.id && (
        <UploadPaymentProofModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          orderId={params.id as string}
          onSuccess={fetchOrderDetail}
        />
      )}

      {/* Payment Proof Detail Modal */}
      <PaymentProofDetailModal
        isOpen={showProofDetail}
        onClose={() => {
          setShowProofDetail(false);
          setSelectedProof(null);
        }}
        proof={selectedProof}
        proofNumber={
          selectedProof
            ? order?.paymentProofs.findIndex(
                (p) => p.imageUrl === selectedProof.imageUrl
              )! + 1
            : undefined
        }
        totalProofs={order?.paymentProofs.length}
        onNext={() => {
          if (!order || !selectedProof) return;
          const currentIndex = order.paymentProofs.findIndex(
            (p) => p.imageUrl === selectedProof.imageUrl
          );
          if (currentIndex < order.paymentProofs.length - 1) {
            setSelectedProof(order.paymentProofs[currentIndex + 1]);
          }
        }}
        onPrev={() => {
          if (!order || !selectedProof) return;
          const currentIndex = order.paymentProofs.findIndex(
            (p) => p.imageUrl === selectedProof.imageUrl
          );
          if (currentIndex > 0) {
            setSelectedProof(order.paymentProofs[currentIndex - 1]);
          }
        }}
      />
    </div>
  );
}
