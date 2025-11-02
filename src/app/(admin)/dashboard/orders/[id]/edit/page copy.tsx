"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getById, updateData } from "@/lib/apiService";
import { OrderData, IOrderDetail, IShippingAddress } from "@/lib/types/order";
import LoadingPage from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Save,
} from "lucide-react";
import { currencyFormat } from "@/lib/helpers";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleShippingAddressChange = (
    field: keyof IShippingAddress,
    value: string
  ) => {
    if (!order) return;
    setOrder({
      ...order,
      shippingAddress: {
        ...order.shippingAddress,
        [field]: value,
      },
    });
  };

  const handleOrderDetailChange = (
    index: number,
    field: keyof IOrderDetail,
    value: any
  ) => {
    if (!order) return;

    const updatedDetails = [...order.orderDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };

    // Recalculate subtotal when quantity changes
    if (field === "quantity") {
      const item = updatedDetails[index];
      const unitPrice = item.discountedPrice
        ? item.discountedPrice[order.currency]
        : item.originalPrice[order.currency];
      updatedDetails[index].subTotal = value * unitPrice;
    }

    // Calculate new total amount
    const newTotal = updatedDetails.reduce(
      (sum, item) => sum + item.subTotal,
      0
    );

    setOrder({
      ...order,
      orderDetails: updatedDetails,
      totalAmount: newTotal,
    });
  };

  const handleRemoveOrderDetail = (index: number) => {
    if (!order) return;

    const updatedDetails = order.orderDetails.filter((_, i) => i !== index);
    const newTotal = updatedDetails.reduce(
      (sum, item) => sum + item.subTotal,
      0
    );

    setOrder({
      ...order,
      orderDetails: updatedDetails,
      totalAmount: newTotal,
    });
  };

  const handleSave = async () => {
    if (!order) return;

    setSaving(true);

    try {
      const response = await updateData<OrderData, Partial<OrderData>>(
        "/api/admin/orders",
        id,
        {
          status: order.status,
          shippingCost: order.shippingCost,
          shippingAddress: order.shippingAddress,
          orderDetails: order.orderDetails,
          totalAmount: order.totalAmount,
        }
      );

      showSuccessAlert(
        undefined,
        response.message || "Order updated successfully"
      );
      router.push("/dashboard/orders");
    } catch (err: any) {
      showErrorAlert(undefined, err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error || "Order not found"}</p>
        </div>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      "pending confirmation": {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="w-4 h-4" />,
        label: "Pending Confirmation",
      },
      paid: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Paid",
      },
      processing: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Package className="w-4 h-4" />,
        label: "Processing",
      },
      shipped: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Truck className="w-4 h-4" />,
        label: "Shipped",
      },
    };

    const config = statusConfig[status] || statusConfig["pending confirmation"];

    return (
      <div
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border font-medium ${config.color}`}
      >
        {config.icon}
        <span>{config.label}</span>
      </div>
    );
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
              <p className="text-gray-600 mt-1">
                Modify order information and details
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(order.status)}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Invoice Number</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {order.invoiceNumber}
              </p>
            </div>

            <div>
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Order Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
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
              <p className="text-lg font-semibold text-gray-900">
                {order.currency.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Status Selector */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Label className="text-base font-medium text-gray-700 mb-2 block">
              Order Status *
            </Label>
            <Select
              value={order.status}
              onValueChange={(value: any) =>
                setOrder({ ...order, status: value })
              }
            >
              <SelectTrigger className="max-w-xs border-gray-300 focus:border-primary/80 focus:ring-primary/80">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending confirmation">
                  Pending Confirmation
                </SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
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
                  <Label className="text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Full Name *</span>
                  </Label>
                  <Input
                    value={order.shippingAddress.fullName}
                    onChange={(e) =>
                      handleShippingAddressChange("fullName", e.target.value)
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>Email *</span>
                  </Label>
                  <Input
                    type="email"
                    value={order.shippingAddress.email}
                    onChange={(e) =>
                      handleShippingAddressChange("email", e.target.value)
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>Phone *</span>
                  </Label>
                  <Input
                    value={order.shippingAddress.phone}
                    onChange={(e) =>
                      handleShippingAddressChange("phone", e.target.value)
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Country *</span>
                  </Label>
                  <Input
                    value={order.shippingAddress.country}
                    onChange={(e) =>
                      handleShippingAddressChange("country", e.target.value)
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1">
                    City *
                  </Label>
                  <Input
                    value={order.shippingAddress.city}
                    onChange={(e) =>
                      handleShippingAddressChange("city", e.target.value)
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1">
                    District *
                  </Label>
                  <Input
                    value={order.shippingAddress.district}
                    onChange={(e) =>
                      handleShippingAddressChange("district", e.target.value)
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-1">
                    Zip Code *
                  </Label>
                  <Input
                    value={order.shippingAddress.zipCode}
                    onChange={(e) =>
                      handleShippingAddressChange("zipCode", e.target.value)
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </Label>
                <Input
                  value={order.shippingAddress.address}
                  onChange={(e) =>
                    handleShippingAddressChange("address", e.target.value)
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  required
                />
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

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1">
                  Shipping Cost *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={order.shippingCost}
                  onChange={(e) =>
                    setOrder({
                      ...order,
                      shippingCost: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-2xl font-bold text-primary">
                  {currencyFormat(
                    order.totalAmount + order.shippingCost,
                    order.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Original Price
                  </th>
                  {order.orderType === "B2B" && (
                    <>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Discounted Price
                      </th>
                    </>
                  )}
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
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
                          <p className="font-medium text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {item.productId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {item.variantName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleOrderDetailChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20 text-center border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {currencyFormat(
                          item.originalPrice[order.currency],
                          order.currency
                        )}
                      </span>
                    </td>
                    {order.orderType === "B2B" && (
                      <>
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
                            <span className="font-semibold text-orange-600">
                              {currencyFormat(
                                item.discountedPrice[order.currency],
                                order.currency
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-primary">
                        {currencyFormat(item.subTotal, order.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOrderDetail(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td
                    colSpan={order.orderType === "B2B" ? 6 : 3}
                    className="px-6 py-4 text-right font-semibold text-gray-900"
                  >
                    Total Amount:
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xl font-bold text-primary">
                      {currencyFormat(order.totalAmount, order.currency)}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Reseller Pricing Info (if B2B) */}
        {order.orderType === "B2B" &&
          order.orderDetails.some((item) => item.resellerPricing) && (
            <div className="bg-indigo-50 rounded-xl shadow-sm border border-indigo-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-indigo-900">
                  Reseller Tier Pricing Applied
                </h2>
              </div>
              <p className="text-indigo-700">
                This order received reseller tier discounts based on quantity
                purchased.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
