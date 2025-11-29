"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAll, getById, updateData } from "@/lib/apiService";
import { OrderData, IOrderDetail } from "@/lib/types/order";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus,
  Search,
  BanknoteArrowDown,
} from "lucide-react";
import { currencyFormat } from "@/lib/helpers";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import ErrorPage from "@/components/admin/error-page";
import { Textarea } from "@/components/ui/textarea";
import { ProductData } from "@/lib/types/product";
import Link from "next/link";

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedItems, setEditedItems] = useState<IOrderDetail[]>([]);

  // Add Product Modal States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );
  const [showVariantSelection, setShowVariantSelection] = useState(false);

  // Check if order can be edited based on status
  const canEditOrder = () => {
    if (!order) return false;
    return (
      order.status === "pending confirmation" ||
      order.status === "awaiting payment"
    );
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<OrderData>("/api/admin/orders", id);

      if (response.data) {
        setOrder(response.data);
        setEditedItems(response.data.orderDetails);
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

  // Fetch products for add product modal
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await getAll<ProductData>("/api/admin/products");
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      showErrorAlert("Error", "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Open add product modal
  const handleOpenAddProduct = () => {
    if (!canEditOrder()) {
      showErrorAlert(
        "Cannot Edit Order",
        "You can only edit orders with 'Pending Confirmation' or 'Awaiting Payment' status."
      );
      return;
    }
    setShowAddProductModal(true);
    fetchProducts();
  };

  // Select product and show variant selection
  const handleSelectProduct = (product: ProductData) => {
    setSelectedProduct(product);
    setShowVariantSelection(true);
  };

  // Add variant to order
  const handleAddVariant = (variantId: string) => {
    if (!selectedProduct || !order) return;

    const variant = selectedProduct.productVariantsData?.find(
      (v) => v._id === variantId
    );

    if (!variant) return;

    // Check if this variant already exists in order
    const existingItem = editedItems.find(
      (item) => item.variantId === variantId
    );
    if (existingItem) {
      showErrorAlert(
        "Already Added",
        "This product variant is already in the order."
      );
      // Close modals to prevent selecting another variant
      setShowVariantSelection(false);
      setShowAddProductModal(false);
      setSelectedProduct(null);
      return;
    }

    const newItem: IOrderDetail = {
      productId: selectedProduct._id,
      productName: selectedProduct.productName,
      variantId: variant._id,
      variantName: variant.name,
      quantity: 1,
      originalPrice: variant.price,
      discountPercentage: 0,
      discountedPrice: null,
      subTotal: variant.price[order.currency] || 0,
      image:
        variant.image ||
        selectedProduct.productMedia.find((m) => m.type === "image")!,
      stock: variant.stock,
      preOrder: selectedProduct.preOrder,
      moq: selectedProduct.moq,
      resellerPricing: selectedProduct.resellerPricing,
    };

    const newItems = [...editedItems, newItem];
    setEditedItems(newItems);
    updateOrderTotal(newItems);

    // Close modals
    setShowAddProductModal(false);
    setShowVariantSelection(false);
    setSelectedProduct(null);
    setProductSearchQuery("");
  };

  // Filter products by search
  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  // Update item field
  // const updateItemField = (
  //   index: number,
  //   field: keyof IOrderDetail,
  //   value: any
  // ) => {
  //   if (!canEditOrder()) return;

  //   const newItems = [...editedItems];
  //   const item = newItems[index];

  //   if (field === "quantity") {
  //     const qty = parseInt(value) || 1;
  //     item.quantity = qty;
  //     recalculateItemSubtotal(item);
  //   } else if (field === "originalPrice") {
  //     if (!item.originalPrice) item.originalPrice = {};
  //     item.originalPrice[order!.currency] = Math.round(value) || 0;
  //     recalculateItemSubtotal(item);
  //   } else if (field === "discountPercentage") {
  //     const discount = Math.max(0, Math.min(100, Math.round(value) || 0));
  //     item.discountPercentage = discount;
  //     recalculateItemSubtotal(item);
  //   } else if (field === "discountedPrice") {
  //     if (!item.discountedPrice) item.discountedPrice = {};
  //     const discountedPrice = Math.round(value) || 0;
  //     item.discountedPrice[order!.currency] = discountedPrice;

  //     // Recalculate discount percentage from discounted price
  //     const originalPrice = item.originalPrice[order!.currency];
  //     if (originalPrice > 0 && discountedPrice < originalPrice) {
  //       const discountAmount = originalPrice - discountedPrice;
  //       item.discountPercentage = (discountAmount / originalPrice) * 100;
  //     } else {
  //       item.discountPercentage = 0;
  //       item.discountedPrice = null;
  //     }

  //     recalculateItemSubtotal(item);
  //   } else if (field === "subTotal") {
  //     item.subTotal = Math.round(value) || 0;
  //   }

  //   setEditedItems(newItems);
  //   updateOrderTotal(newItems);
  // };

  const formatDecimal = (val: any) => parseFloat(Number(val).toFixed(2));

  const updateItemField = (
    index: number,
    field: keyof IOrderDetail,
    value: any
  ) => {
    if (!canEditOrder()) return;

    const newItems = [...editedItems];
    const item = newItems[index];

    if (field === "quantity") {
      const qty = parseInt(value) || 1;
      item.quantity = qty;
      recalculateItemSubtotal(item);
    } else if (field === "originalPrice") {
      if (!item.originalPrice) item.originalPrice = {};
      item.originalPrice[order!.currency] = formatDecimal(value);
      recalculateItemSubtotal(item);
    } else if (field === "discountPercentage") {
      const discount = Math.max(0, Math.min(100, formatDecimal(value) || 0));
      item.discountPercentage = discount;
      recalculateItemSubtotal(item);
    } else if (field === "discountedPrice") {
      if (!item.discountedPrice) item.discountedPrice = {};

      const discountedPrice = formatDecimal(value);
      item.discountedPrice[order!.currency] = discountedPrice;

      const originalPrice = item?.originalPrice?.[order!.currency] ?? 0;
      if (originalPrice > 0 && discountedPrice < originalPrice) {
        const discountAmount = originalPrice - discountedPrice;
        item.discountPercentage = formatDecimal(
          (discountAmount / originalPrice) * 100
        );
      } else {
        item.discountPercentage = 0;
        item.discountedPrice = null;
      }

      recalculateItemSubtotal(item);
    } else if (field === "subTotal") {
      item.subTotal = formatDecimal(value);
    }

    setEditedItems(newItems);
    updateOrderTotal(newItems);
  };

  // Recalculate item subtotal based on quantity, price, and discount
  const recalculateItemSubtotal = (item: IOrderDetail) => {
    const originalPrice = item.originalPrice[order!.currency];
    const qty = item.quantity;
    const discount = item.discountPercentage || 0;

    if (discount > 0) {
      const discountedPrice = originalPrice - (originalPrice * discount) / 100;
      if (!item.discountedPrice) item.discountedPrice = {};
      item.discountedPrice[order!.currency] = formatDecimal(discountedPrice);
      item.subTotal = formatDecimal(
        item.discountedPrice[order!.currency] * qty
      );
    } else {
      item.discountedPrice = null;
      item.subTotal = formatDecimal(originalPrice * qty);
    }
  };

  // Update order total amount
  const updateOrderTotal = (items: IOrderDetail[]) => {
    const total = items.reduce((sum, item) => sum + item.subTotal, 0);
    if (order) {
      setOrder({ ...order, totalAmount: total, orderDetails: items });
    }
  };

  // Delete item
  const deleteItem = async (index: number) => {
    if (!canEditOrder()) {
      showErrorAlert(
        "Cannot Edit Order",
        "You can only edit orders with 'Pending Confirmation' or 'Awaiting Payment' status."
      );
      return;
    }

    if (editedItems.length === 1) {
      showErrorAlert(
        "Cannot Delete",
        "Order must have at least one item. Consider canceling the order instead."
      );
      return;
    }

    const newItems = editedItems.filter((_, i) => i !== index);
    setEditedItems(newItems);
    updateOrderTotal(newItems);
  };

  // Save changes to order
  const handleSaveChanges = async () => {
    // Validate order items only if order can be edited
    if (canEditOrder()) {
      const invalidItems = editedItems.filter(
        (item) =>
          item.quantity === 0 ||
          !item.originalPrice[order!.currency] ||
          item.originalPrice[order!.currency] === 0
      );

      if (invalidItems.length > 0) {
        showErrorAlert(
          "Invalid Items",
          "Please ensure all items have quantity greater than 0 and original price greater than 0."
        );
        return;
      }

      if (editedItems.length === 0) {
        showErrorAlert("No Items", "Order must have at least one item.");
        return;
      }
    }

    try {
      setSaving(true);

      await updateData<OrderData, Partial<OrderData>>("/api/admin/orders", id, {
        status: order!.status,
        orderDetails: editedItems,
        totalAmount: order!.totalAmount,
        shippingAddress: order!.shippingAddress,
        shippingCost: order!.shippingCost,
        discountShipping: order!.discountShipping || 0,
        currency: order!.currency,
      });

      showSuccessAlert("Success", "Order updated successfully");
      router.push(`/dashboard/orders/${id}/detail`);
    } catch (error: any) {
      showErrorAlert("Error", error.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <Button variant="ghost" className="cursor-pointer" asChild>
          <Link href={"/dashboard/orders"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
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
            {/* Alert if order cannot be edited */}
            {!canEditOrder() && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-amber-800">
                      Order Items Editing Restricted
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      This order's items cannot be edited because its status is
                      "{order.status}". Order items can only be modified when
                      the status is "Pending Confirmation" or "Awaiting
                      Payment". However, you can still update the order status
                      and shipping information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Invoice Number</span>
                  </div>
                  <Input
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                    disabled
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

                <div>
                  <div className="flex items-center space-x-2 text-gray-600 ">
                    <BanknoteArrowDown className="w-4 h-4" />
                    <span className="text-sm font-medium">Revenue </span>
                  </div>
                  <span className="text-xs mb-2">(convert rupiah amount)</span>
                  <Input
                    type="text"
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                    disabled
                    defaultValue={order.revenue || 0}
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="mt-6 pt-6 border-t border-gray-200">
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
                    <SelectItem value="awaiting payment">
                      Awaiting Payment
                    </SelectItem>
                    <SelectItem value="payment confirmed">
                      Payment Confirmed
                    </SelectItem>
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
                        disabled={!canEditOrder()}
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
                        disabled={!canEditOrder()}
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
                        disabled={!canEditOrder()}
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
                        disabled={!canEditOrder()}
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
                        disabled={!canEditOrder()}
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
                        disabled={!canEditOrder()}
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
                        disabled={!canEditOrder()}
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
                      disabled={!canEditOrder()}
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
                      min="0"
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
                      disabled={!canEditOrder()}
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">
                      Discount Shipping
                    </Label>

                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={order.shippingCost}
                      onChange={(e) =>
                        setOrder((prev) =>
                          prev
                            ? {
                                ...prev,
                                discountShipping:
                                  parseFloat(e.target.value) || 0,
                              }
                            : prev
                        )
                      }
                      value={order.discountShipping || 0}
                      className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                      disabled={!canEditOrder()}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
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

            {/* Order Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
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
                  {canEditOrder() && (
                    <Button
                      onClick={handleOpenAddProduct}
                      size="sm"
                      className="cursor-pointer bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  )}
                </div>
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
                      {canEditOrder() && (
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 tracking-wider">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {editedItems.map((item, index) => (
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
                              value={item.quantity}
                              onChange={(e) =>
                                updateItemField(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              disabled={!canEditOrder()}
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
                              value={item.originalPrice[order.currency]}
                              onChange={(e) =>
                                updateItemField(
                                  index,
                                  "originalPrice",
                                  e.target.value
                                )
                              }
                              disabled={!canEditOrder()}
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
                              value={item.discountPercentage || 0}
                              onChange={(e) =>
                                updateItemField(
                                  index,
                                  "discountPercentage",
                                  e.target.value
                                )
                              }
                              disabled={!canEditOrder()}
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
                              value={
                                item.discountedPrice
                                  ? item.discountedPrice[order.currency]
                                  : 0
                              }
                              onChange={(e) =>
                                updateItemField(
                                  index,
                                  "discountedPrice",
                                  e.target.value
                                )
                              }
                              disabled={!canEditOrder()}
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
                              value={item.subTotal}
                              onChange={(e) =>
                                updateItemField(
                                  index,
                                  "subTotal",
                                  e.target.value
                                )
                              }
                              disabled
                            />
                          </div>
                        </td>
                        {canEditOrder() && (
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => deleteItem(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete item"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td
                        colSpan={canEditOrder() ? 6 : 5}
                        className="px-6 py-4 text-right font-semibold text-gray-900"
                      >
                        Total Amount:
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        colSpan={canEditOrder() ? 1 : 1}
                      >
                        <span className="font-bold text-primary">
                          {currencyFormat(order.totalAmount, order.currency)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/orders/${id}/detail`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            {/* Add Product Modal */}
            <Dialog
              open={showAddProductModal}
              onOpenChange={setShowAddProductModal}
            >
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Product to Order</DialogTitle>
                  <DialogDescription>
                    Select a product to add to this order. You will then choose
                    a variant.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto">
                    {products
                      .filter((product) =>
                        product.productName
                          .toLowerCase()
                          .includes(productSearchQuery.toLowerCase())
                      )
                      .map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleSelectProduct(product)}
                          className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-gray-50 transition-all"
                        >
                          <div className="flex items-start space-x-3">
                            <img
                              src={
                                product.productMedia?.[0]?.imageUrl ||
                                "/placeholder.jpg"
                              }
                              alt={product.productName}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {product.productName}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {product.productDescription}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  {product.productVariantsData?.length || 0}{" "}
                                  variants
                                </span>
                                <span className="text-sm font-medium text-primary">
                                  Click to select
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {products.filter((product) =>
                    product.productName
                      .toLowerCase()
                      .includes(productSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Variant Selection Modal */}
            <Dialog
              open={showVariantSelection}
              onOpenChange={setShowVariantSelection}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Select Variant</DialogTitle>
                  <DialogDescription>
                    Choose a variant for {selectedProduct?.productName}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {selectedProduct?.productVariantsData?.map((variant) => {
                    const isOutOfStock = !variant.stock || variant.stock === 0;
                    return (
                      <div
                        key={variant._id}
                        onClick={() =>
                          !isOutOfStock && handleAddVariant(variant._id)
                        }
                        className={`border rounded-lg p-4 transition-all ${
                          isOutOfStock
                            ? "opacity-50 cursor-not-allowed bg-gray-100"
                            : "cursor-pointer hover:border-primary hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                variant.image?.imageUrl || "/placeholder.jpg"
                              }
                              alt={variant.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h4
                                className={`font-semibold ${isOutOfStock ? "text-gray-500" : "text-gray-900"}`}
                              >
                                {variant.name}
                              </h4>
                              <p
                                className={`text-sm mt-1 ${isOutOfStock ? "text-red-600 font-medium" : "text-gray-600"}`}
                              >
                                Stock: {variant.stock || 0}{" "}
                                {isOutOfStock && "(Out of Stock)"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${isOutOfStock ? "text-gray-500" : "text-gray-900"}`}
                            >
                              {currencyFormat(
                                variant.price?.[order.currency] || 0,
                                order.currency
                              )}
                            </p>
                            {!isOutOfStock ? (
                              <span className="text-sm text-primary font-medium">
                                Click to add
                              </span>
                            ) : (
                              <span className="text-sm text-red-600 font-medium">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {(!selectedProduct?.productVariantsData ||
                    selectedProduct.productVariantsData.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No variants available for this product
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )
      )}
    </div>
  );
}
