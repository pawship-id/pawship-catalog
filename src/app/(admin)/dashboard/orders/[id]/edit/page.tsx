"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getById, updateData } from "@/lib/apiService";
import {
  OrderData,
  IOrderDetail,
  IShippingAddress,
  OrderForm,
} from "@/lib/types/order";
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
import ErrorPage from "@/components/admin/error-page";
import { Textarea } from "@/components/ui/textarea";

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

  //   // Helper function to calculate subtotal from original price, quantity, and discount
  //   const calculateSubtotalFromDiscount = (
  //     originalPrice: number,
  //     quantity: number,
  //     discountPercentage: number
  //   ) => {
  //     const totalBeforeDiscount = originalPrice * quantity;
  //     const discountAmount = (totalBeforeDiscount * discountPercentage) / 100;
  //     return Math.round(totalBeforeDiscount - discountAmount);
  //   };

  //   // Helper function to calculate discount percentage from subtotal
  //   const calculateDiscountFromSubtotal = (
  //     originalPrice: number,
  //     quantity: number,
  //     subtotal: number
  //   ) => {
  //     const totalBeforeDiscount = originalPrice * quantity;
  //     if (totalBeforeDiscount === 0) return 0;
  //     const discountAmount = totalBeforeDiscount - subtotal;
  //     const discountPercentage = (discountAmount / totalBeforeDiscount) * 100;
  //     return Math.max(
  //       0,
  //       Math.min(100, Math.round(discountPercentage * 100) / 100)
  //     ); // Round to 2 decimals and clamp between 0-100
  //   };

  //   // Update order detail and recalculate total
  //   const updateOrderDetailAndTotal = (updatedDetails: IOrderDetail[]) => {
  //     const newTotal = updatedDetails.reduce(
  //       (sum, item) => sum + item.subTotal,
  //       0
  //     );
  //     setOrder((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             orderDetails: updatedDetails,
  //             totalAmount: newTotal,
  //           }
  //         : prev
  //     );
  //   };

  //   // Handle original price change
  //   const handleOriginalPriceChange = (index: number, newPrice: number) => {
  //     if (!order) return;
  //     const updatedDetails = [...order.orderDetails];
  //     const item = updatedDetails[index];

  //     updatedDetails[index] = {
  //       ...item,
  //       originalPrice: {
  //         ...item.originalPrice,
  //         [order.currency]: newPrice,
  //       },
  //       subTotal: calculateSubtotalFromDiscount(
  //         newPrice,
  //         item.quantity,
  //         item.discountPercentage || 0
  //       ),
  //     };

  //     // Update discounted price if there's a discount
  //     if (item.discountPercentage && item.discountPercentage > 0) {
  //       const discountedUnitPrice = Math.round(
  //         newPrice - (newPrice * item.discountPercentage) / 100
  //       );
  //       updatedDetails[index].discountedPrice = {
  //         ...item.discountedPrice,
  //         [order.currency]: discountedUnitPrice,
  //       };
  //     }

  //     updateOrderDetailAndTotal(updatedDetails);
  //   };

  //   // Handle quantity change
  //   const handleQuantityChange = (index: number, newQuantity: number) => {
  //     if (!order || newQuantity < 1) return;
  //     const updatedDetails = [...order.orderDetails];
  //     const item = updatedDetails[index];

  //     updatedDetails[index] = {
  //       ...item,
  //       quantity: newQuantity,
  //       subTotal: calculateSubtotalFromDiscount(
  //         item.originalPrice[order.currency],
  //         newQuantity,
  //         item.discountPercentage || 0
  //       ),
  //     };

  //     updateOrderDetailAndTotal(updatedDetails);
  //   };

  //   // Handle discount percentage change
  //   const handleDiscountChange = (index: number, newDiscount: number) => {
  //     if (!order) return;
  //     const updatedDetails = [...order.orderDetails];
  //     const item = updatedDetails[index];

  //     // Clamp discount between 0 and 100
  //     const clampedDiscount = Math.max(0, Math.min(100, newDiscount));

  //     updatedDetails[index] = {
  //       ...item,
  //       discountPercentage: clampedDiscount,
  //       subTotal: calculateSubtotalFromDiscount(
  //         item.originalPrice[order.currency],
  //         item.quantity,
  //         clampedDiscount
  //       ),
  //     };

  //     // Update discounted price
  //     if (clampedDiscount > 0) {
  //       const discountedUnitPrice = Math.round(
  //         item.originalPrice[order.currency] -
  //           (item.originalPrice[order.currency] * clampedDiscount) / 100
  //       );
  //       updatedDetails[index].discountedPrice = {
  //         [order.currency]: discountedUnitPrice,
  //       };
  //     } else {
  //       updatedDetails[index].discountedPrice = undefined;
  //     }

  //     updateOrderDetailAndTotal(updatedDetails);
  //   };

  //   // Handle subtotal change (calculate discount from it)
  //   const handleSubtotalChange = (index: number, newSubtotal: number) => {
  //     if (!order || newSubtotal < 0) return;
  //     const updatedDetails = [...order.orderDetails];
  //     const item = updatedDetails[index];

  //     const originalPrice = item.originalPrice[order.currency];
  //     const totalBeforeDiscount = originalPrice * item.quantity;

  //     // Don't allow subtotal greater than total before discount
  //     const clampedSubtotal = Math.min(newSubtotal, totalBeforeDiscount);

  //     const newDiscount = calculateDiscountFromSubtotal(
  //       originalPrice,
  //       item.quantity,
  //       clampedSubtotal
  //     );

  //     updatedDetails[index] = {
  //       ...item,
  //       subTotal: clampedSubtotal,
  //       discountPercentage: newDiscount,
  //     };

  //     // Update discounted price
  //     if (newDiscount > 0) {
  //       const discountedUnitPrice = Math.round(
  //         originalPrice - (originalPrice * newDiscount) / 100
  //       );
  //       updatedDetails[index].discountedPrice = {
  //         [order.currency]: discountedUnitPrice,
  //       };
  //     } else {
  //       updatedDetails[index].discountedPrice = undefined;
  //     }

  //     updateOrderDetailAndTotal(updatedDetails);
  //   };

  console.log(order);

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
            <Button
              disabled={saving}
              size="sm"
              className="cursor-pointer bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
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
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Invoice Number</span>
                  </div>
                  <Input
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                    required
                    onChange={(e) =>
                      setOrder((prev) =>
                        prev ? { ...prev, invoiceNumber: e.target.value } : prev
                      )
                    }
                    value={order.invoiceNumber}
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Order Date</span>
                  </div>
                  <Input
                    type="date"
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                    disabled
                    defaultValue={
                      order.orderDate
                        ? new Date(order.orderDate).toISOString().split("T")[0]
                        : ""
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">Order Type</span>
                  </div>
                  <Input
                    type="text"
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                    disabled
                    defaultValue={order.orderType}
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Currency</span>
                  </div>
                  <Input
                    type="text"
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                    disabled
                    defaultValue={order.currency}
                  />
                </div>
              </div>

              {/* Status Selector */}
              {/* <div className="mt-6 pt-6 border-t border-gray-200">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
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
              </div> */}
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
                      <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Full Name *</span>
                      </Label>
                      <Input
                        className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                        required
                        onChange={(e) =>
                          setOrder((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  shippingAddress: {
                                    ...prev.shippingAddress,
                                    fullName: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                        value={order.shippingAddress.fullName}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>Email *</span>
                      </Label>
                      <Input
                        type="email"
                        onChange={(e) =>
                          setOrder((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  shippingAddress: {
                                    ...prev.shippingAddress,
                                    email: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                        value={order.shippingAddress.email}
                        className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>Phone *</span>
                      </Label>
                      <Input
                        value={order.shippingAddress.phone}
                        onChange={(e) =>
                          setOrder((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  shippingAddress: {
                                    ...prev.shippingAddress,
                                    phone: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                        className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Country *</span>
                      </Label>
                      <Input
                        onChange={(e) =>
                          setOrder((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  shippingAddress: {
                                    ...prev.shippingAddress,
                                    country: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                        value={order.shippingAddress.country}
                        className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        City *
                      </Label>
                      <Input
                        onChange={(e) =>
                          setOrder((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  shippingAddress: {
                                    ...prev.shippingAddress,
                                    city: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                        value={order.shippingAddress.city}
                        className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        District *
                      </Label>
                      <Input
                        onChange={(e) =>
                          setOrder((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  shippingAddress: {
                                    ...prev.shippingAddress,
                                    district: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                        value={order.shippingAddress.district}
                        className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        Zip Code *
                      </Label>
                      <Input
                        onChange={(e) =>
                          setOrder((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  shippingAddress: {
                                    ...prev.shippingAddress,
                                    zipCode: e.target.value,
                                  },
                                }
                              : prev
                          )
                        }
                        value={order.shippingAddress.zipCode}
                        className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </Label>
                    <Textarea
                      onChange={(e) =>
                        setOrder((prev) =>
                          prev
                            ? {
                                ...prev,
                                shippingAddress: {
                                  ...prev.shippingAddress,
                                  address: e.target.value,
                                },
                              }
                            : prev
                        )
                      }
                      className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                      required
                      value={order.shippingAddress.address}
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
                    <Label className="text-sm font-medium text-gray-700 mb-2">
                      Shipping Cost *
                    </Label>

                    <Input
                      type="number"
                      step="0.01"
                      onChange={(e) =>
                        setOrder((prev) =>
                          prev
                            ? {
                                ...prev,
                                shippingCost: parseFloat(e.target.value) || 0,
                              }
                            : prev
                        )
                      }
                      value={order.shippingCost}
                      className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
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
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 tracking-wider">
                        Original Price
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 tracking-wider">
                        Discount %
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 tracking-wider">
                        Discounted Price
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 tracking-wider">
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
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              min="1"
                              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4 min-w-[50px] max-w-[70px]"
                              required
                              defaultValue={item.quantity}
                              //   onChange={(e) =>
                              //     handleQuantityChange(
                              //       index,
                              //       parseInt(e.target.value) || 1
                              //     )
                              //   }
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4 min-w-[90px] max-w-[120px]"
                              required
                              defaultValue={item.originalPrice[order.currency]}
                              //   onChange={(e) =>
                              //     handleOriginalPriceChange(
                              //       index,
                              //       parseFloat(e.target.value) || 0
                              //     )
                              //   }
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4 min-w-[90px] max-w-[120px]"
                              required
                              defaultValue={item.discountPercentage || 0}
                              //   onChange={(e) =>
                              //     handleDiscountChange(
                              //       index,
                              //       parseFloat(e.target.value) || 0
                              //     )
                              //   }
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4 min-w-[90px] max-w-[120px]"
                              required
                              defaultValue={
                                item.discountedPrice
                                  ? item.discountedPrice[order.currency]
                                  : 0
                              }
                              //   onChange={(e) =>
                              //     handleSubtotalChange(
                              //       index,
                              //       parseFloat(e.target.value) || 0
                              //     )
                              //   }
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4 min-w-[90px] max-w-[120px]"
                              required
                              defaultValue={item.subTotal}
                              //   onChange={(e) =>
                              //     handleSubtotalChange(
                              //       index,
                              //       parseFloat(e.target.value) || 0
                              //     )
                              //   }
                            />
                          </div>
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
