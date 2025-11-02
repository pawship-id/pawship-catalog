"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { useRouter } from "next/navigation";
import { updateData } from "@/lib/apiService";
import { ApiResponse } from "@/lib/types/api";
import { OrderData, IOrderDetail } from "@/lib/types/order";
import { Trash2, Plus } from "lucide-react";
import { currencyFormat } from "@/lib/helpers";

interface OrderFormProps {
  initialData?: OrderData;
  orderId?: string;
}

export default function FormOrder({ initialData, orderId }: OrderFormProps) {
  const [formData, setFormData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isEditMode = !!orderId;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    setLoading(true);

    try {
      const response: ApiResponse<OrderData> = await updateData<
        OrderData,
        Partial<OrderData>
      >("/api/admin/orders", orderId!, {
        status: formData.status,
        shippingCost: formData.shippingCost,
        shippingAddress: formData.shippingAddress,
        orderDetails: formData.orderDetails,
        totalAmount: formData.totalAmount,
      });

      showSuccessAlert(
        undefined,
        response.message || "Order updated successfully"
      );
      router.push("/dashboard/orders");
    } catch (err: any) {
      showErrorAlert(undefined, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShippingAddressChange = (
    field: keyof OrderData["shippingAddress"],
    value: string
  ) => {
    if (!formData) return;

    setFormData({
      ...formData,
      shippingAddress: {
        ...formData.shippingAddress,
        [field]: value,
      },
    });
  };

  const handleOrderDetailChange = (
    index: number,
    field: keyof IOrderDetail,
    value: any
  ) => {
    if (!formData) return;

    const updatedDetails = [...formData.orderDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };

    // Recalculate subtotal when quantity changes
    if (field === "quantity") {
      const item = updatedDetails[index];
      const unitPrice = item.discountedPrice
        ? item.discountedPrice[formData.currency]
        : item.originalPrice[formData.currency];
      updatedDetails[index].subTotal = value * unitPrice;
    }

    // Calculate new total amount
    const newTotal = updatedDetails.reduce(
      (sum, item) => sum + item.subTotal,
      0
    );

    setFormData({
      ...formData,
      orderDetails: updatedDetails,
      totalAmount: newTotal,
    });
  };

  const handleRemoveOrderDetail = (index: number) => {
    if (!formData) return;

    const updatedDetails = formData.orderDetails.filter((_, i) => i !== index);
    const newTotal = updatedDetails.reduce(
      (sum, item) => sum + item.subTotal,
      0
    );

    setFormData({
      ...formData,
      orderDetails: updatedDetails,
      totalAmount: newTotal,
    });
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit}>
      {/* Order Status & Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="invoiceNumber"
              className="text-base font-medium text-gray-700"
            >
              Invoice Number
            </Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              disabled
              className="bg-gray-50 border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="orderType"
              className="text-base font-medium text-gray-700"
            >
              Order Type
            </Label>
            <Input
              id="orderType"
              value={formData.orderType}
              disabled
              className="bg-gray-50 border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="status"
              className="text-base font-medium text-gray-700"
            >
              Order Status *
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80">
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

          <div className="space-y-2">
            <Label
              htmlFor="currency"
              className="text-base font-medium text-gray-700"
            >
              Currency
            </Label>
            <Input
              id="currency"
              value={formData.currency}
              disabled
              className="bg-gray-50 border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="shippingCost"
              className="text-base font-medium text-gray-700"
            >
              Shipping Cost *
            </Label>
            <Input
              id="shippingCost"
              type="number"
              step="0.01"
              value={formData.shippingCost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shippingCost: parseFloat(e.target.value) || 0,
                })
              }
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-700">
              Order Date
            </Label>
            <Input
              value={new Date(formData.orderDate).toLocaleDateString()}
              disabled
              className="bg-gray-50 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Shipping Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-base font-medium text-gray-700"
            >
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={formData.shippingAddress.fullName}
              onChange={(e) =>
                handleShippingAddressChange("fullName", e.target.value)
              }
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-base font-medium text-gray-700"
            >
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.shippingAddress.email}
              onChange={(e) =>
                handleShippingAddressChange("email", e.target.value)
              }
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-base font-medium text-gray-700"
            >
              Phone *
            </Label>
            <Input
              id="phone"
              value={formData.shippingAddress.phone}
              onChange={(e) =>
                handleShippingAddressChange("phone", e.target.value)
              }
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="country"
              className="text-base font-medium text-gray-700"
            >
              Country *
            </Label>
            <Input
              id="country"
              value={formData.shippingAddress.country}
              onChange={(e) =>
                handleShippingAddressChange("country", e.target.value)
              }
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="city"
              className="text-base font-medium text-gray-700"
            >
              City *
            </Label>
            <Input
              id="city"
              value={formData.shippingAddress.city}
              onChange={(e) =>
                handleShippingAddressChange("city", e.target.value)
              }
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="district"
              className="text-base font-medium text-gray-700"
            >
              District *
            </Label>
            <Input
              id="district"
              value={formData.shippingAddress.district}
              onChange={(e) =>
                handleShippingAddressChange("district", e.target.value)
              }
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="zipCode"
              className="text-base font-medium text-gray-700"
            >
              Zip Code *
            </Label>
            <Input
              id="zipCode"
              value={formData.shippingAddress.zipCode}
              onChange={(e) =>
                handleShippingAddressChange("zipCode", e.target.value)
              }
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="address"
              className="text-base font-medium text-gray-700"
            >
              Street Address *
            </Label>
            <Input
              id="address"
              value={formData.shippingAddress.address}
              onChange={(e) =>
                handleShippingAddressChange("address", e.target.value)
              }
              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
              required
            />
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Order Items</h2>
          <p className="text-gray-600">
            {formData.orderDetails.length} item(s)
          </p>
        </div>

        <div className="space-y-4">
          {formData.orderDetails.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image.imageUrl}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-600">{item.variantName}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOrderDetail(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Quantity *
                  </Label>
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
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Original Price
                  </Label>
                  <Input
                    value={currencyFormat(
                      item.originalPrice[formData.currency],
                      formData.currency
                    )}
                    disabled
                    className="bg-gray-50 border-gray-300"
                  />
                </div>

                {item.discountedPrice && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Discounted Price
                    </Label>
                    <Input
                      value={currencyFormat(
                        item.discountedPrice[formData.currency],
                        formData.currency
                      )}
                      disabled
                      className="bg-gray-50 border-gray-300"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Subtotal
                  </Label>
                  <Input
                    value={currencyFormat(item.subTotal, formData.currency)}
                    disabled
                    className="bg-gray-50 border-gray-300 font-semibold"
                  />
                </div>
              </div>

              {item.discountPercentage && item.discountPercentage > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    {item.discountPercentage}% Discount Applied
                  </span>
                  {formData.orderType === "B2B" && (
                    <span className="text-gray-600">
                      (Reseller Tier Discount)
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal ({formData.orderDetails.length} items)</span>
            <span className="font-semibold">
              {currencyFormat(formData.totalAmount, formData.currency)}
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Shipping Cost</span>
            <span className="font-semibold">
              {currencyFormat(formData.shippingCost, formData.currency)}
            </span>
          </div>
          <div className="border-t border-gray-300 pt-3 flex justify-between">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-primary">
              {currencyFormat(
                formData.totalAmount + formData.shippingCost,
                formData.currency
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-4">
        <Link href="/dashboard/orders">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
