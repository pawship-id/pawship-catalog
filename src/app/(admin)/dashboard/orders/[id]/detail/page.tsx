"use client";

import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";
import { Button } from "@/components/ui/button";
import { getById } from "@/lib/apiService";
import { currencyFormat } from "@/lib/helpers";
import { OrderData } from "@/lib/types/order";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function DetailProduct() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getOrderTypeBadge = (type: string) => {
    return type === "B2B" ? (
      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200">
        B2B - Reseller
      </span>
    ) : (
      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
        B2C - Customer
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
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        {order && (
          <div className="flex gap-4">
            {getStatusBadge(order.status)}

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {currencyFormat(
                        order.totalAmount + order.shippingCost,
                        order.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
