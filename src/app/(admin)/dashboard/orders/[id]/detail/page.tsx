"use client";

import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";
import { Button } from "@/components/ui/button";
import { getById } from "@/lib/apiService";
import { currencyFormat } from "@/lib/helpers";
import { OrderData } from "@/lib/types/order";
import { UploadPaymentProofModal } from "@/components/orders/upload-payment-proof-modal";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Upload,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  Trash2,
  FileImage,
  BanknoteArrowDown,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function DetailProduct() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const getOrderTypeBadge = (type: string) => {
    return type === "B2B" ? (
      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200">
        B2B
      </span>
    ) : (
      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
        B2C
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      "pending confirmation": {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: <Clock className="w-4 h-4" />,
        label: "Pending Confirmation",
      },
      "awaiting payment": {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CreditCard className="w-4 h-4" />,
        label: "Awaiting Payment",
      },
      "payment confirmed": {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Payment Confirmed",
      },
      processing: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Package className="w-4 h-4" />,
        label: "Processing",
      },
      shipped: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Truck className="w-4 h-4" />,
        label: "Shipped",
      },
    };

    const config = statusConfig[status] || statusConfig["pending confirmation"];

    return (
      <div
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border font-medium text-sm ${config.color}`}
      >
        {config.icon}
        <span>{config.label}</span>
      </div>
    );
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<OrderData>("/api/admin/orders", id);

      if (response.data) {
        setOrder(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);
  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <Button variant="ghost" className="cursor-pointer" asChild>
          <Link href={"/dashboard/orders"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>

        {order && (
          <div className="flex gap-4">
            {getStatusBadge(order.status)}

            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Proof
            </Button>

            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/orders/${order._id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Order
            </Button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {id && (
        <UploadPaymentProofModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          orderId={id}
          onSuccess={fetchOrder}
        />
      )}

      {loading ? (
        <div className="mt-20">
          <LoadingPage />
        </div>
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/orders" />
      ) : (
        order && (
          <div className="my-5 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Invoice Number</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {order.invoiceNumber}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Order Date</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(order.orderDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">Order Type</span>
                  </div>
                  {getOrderTypeBadge(order.orderType)}
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Currency</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {order.currency.toUpperCase()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 ">
                    <BanknoteArrowDown className="w-4 h-4" />
                    <span className="text-sm font-medium">Revenue </span>
                  </div>
                  <span className="text-xs mb-2">(convert rupiah amount)</span>
                  <p className="text-lg font-semibold text-foreground">
                    {currencyFormat(order.revenue || 0, "IDR")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shipping Address */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Shipping Address
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Full Name</span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {order.shippingAddress.fullName}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {order.shippingAddress.email}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">Phone</span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {order.shippingAddress.phone}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Country</span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {order.shippingAddress.country}
                      </p>
                    </div>

                    <div>
                      <div className="text-gray-600 mb-1 text-sm font-medium">
                        City
                      </div>
                      <p className="text-gray-900 font-medium">
                        {order.shippingAddress.city}
                      </p>
                    </div>

                    <div>
                      <div className="text-gray-600 mb-1 text-sm font-medium">
                        District
                      </div>
                      <p className="text-gray-900 font-medium">
                        {order.shippingAddress.district}
                      </p>
                    </div>

                    <div>
                      <div className="text-gray-600 mb-1 text-sm font-medium">
                        Zip Code
                      </div>
                      <p className="text-gray-900 font-medium">
                        {order.shippingAddress.zipCode}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-600 mb-1 text-sm font-medium">
                      Street Address
                    </div>
                    <p className="text-gray-900 font-medium">
                      {order.shippingAddress.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {currencyFormat(order.totalAmount, order.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Shipping Cost</span>
                    <span className="font-semibold text-gray-900">
                      {currencyFormat(order.shippingCost, order.currency)}
                    </span>
                  </div>

                  {order.discountShipping > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Discount Shipping</span>
                      <span className="font-semibold text-red-600">
                        -{" "}
                        {currencyFormat(order.discountShipping, order.currency)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {currencyFormat(
                        order.totalAmount +
                          order.shippingCost -
                          (order.discountShipping || 0),
                        order.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Proofs Section */}
            {order.paymentProofs && order.paymentProofs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Payment Proofs ({order.paymentProofs.length})
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {order.paymentProofs.map((proof, index) => (
                    <div
                      key={index}
                      className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                    >
                      {/* Image */}
                      <div className="relative w-full h-48 bg-gray-100 cursor-pointer overflow-hidden">
                        <img
                          src={proof.imageUrl}
                          alt={`Payment proof ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onClick={() => window.open(proof.imageUrl, "_blank")}
                        />
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-3">
                        {proof.note && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">
                              Note
                            </p>
                            <p className="text-sm text-gray-900 line-clamp-2">
                              {proof.note}
                            </p>
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {new Date(proof.uploadedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <User className="h-3.5 w-3.5" />
                            <span className="font-medium text-gray-700">
                              {proof.uploadedBy}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                          onClick={async () => {
                            if (
                              !confirm(
                                "Are you sure you want to delete this payment proof?"
                              )
                            )
                              return;
                            try {
                              const res = await fetch(
                                `/api/orders/payment-proof/${id}?imagePublicId=${encodeURIComponent(
                                  proof.imagePublicId
                                )}`,
                                { method: "DELETE" }
                              );
                              const result = await res.json();
                              if (result.success) {
                                fetchOrder();
                              } else {
                                alert(result.message || "Failed to delete");
                              }
                            } catch (err) {
                              console.error(err);
                              alert("Delete failed");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order Items
                  </h2>
                </div>
                <p className="text-gray-600 mt-1">
                  {order.orderDetails.length} item(s) in this order
                </p>
              </div>

              <div className="overflow-x-auto m-4 rounded-xl">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 tracking-wider">
                        Original Price
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 tracking-wider">
                        Discounted Price
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.orderDetails.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image.imageUrl}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                            <div>
                              <p className="font-semibold text-sm mb-2 text-foreground">
                                {item.productName}
                              </p>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                {item.variantName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-foreground">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-foreground">
                            {currencyFormat(
                              item.originalPrice[order.currency],
                              order.currency
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.discountPercentage ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              -{item.discountPercentage}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.discountedPrice ? (
                            <span className=" text-orange-600">
                              {currencyFormat(
                                item.discountedPrice[order.currency],
                                order.currency
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-primary">
                            {currencyFormat(item.subTotal, order.currency)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-right font-semibold text-gray-900"
                      >
                        Total Amount:
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-primary">
                          {currencyFormat(order.totalAmount, order.currency)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
