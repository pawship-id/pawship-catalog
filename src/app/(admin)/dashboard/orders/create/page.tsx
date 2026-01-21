"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createData, getAll } from "@/lib/apiService";
import { IOrderDetail, OrderForm } from "@/lib/types/order";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Truck,
  Plus,
  Search,
  Trash2,
  Save,
  Mail,
  Phone,
} from "lucide-react";
import { currencyFormat } from "@/lib/helpers";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { UserData } from "@/lib/types/user";
import { ProductData, TCurrency } from "@/lib/types/product";
import Link from "next/link";
import ProductSelectorModal from "@/components/admin/orders/product-selector-modal";
import VariantSelectorModal from "@/components/admin/orders/variant-selector-modal";
import { Textarea } from "@/components/ui/textarea";

export default function CreateOrderPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Customer Selection
  const [customers, setCustomers] = useState<UserData[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(
    null,
  );
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Product Selection
  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null,
  );
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantSelection, setShowVariantSelection] = useState(false);
  const [orderItems, setOrderItems] = useState<IOrderDetail[]>([]);

  // Order Form
  const [currency, setCurrency] = useState<TCurrency>("IDR");
  const [shippingCost, setShippingCost] = useState(0);
  const [discountShipping, setDiscountShipping] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    district: "",
    zipCode: "",
    address: "",
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAll<UserData>("/api/admin/users");
      if (response.data) {
        // Filter only retail and reseller users
        const filteredUsers = response.data.filter(
          (user) => user.role === "retail" || user.role === "reseller",
        );
        setCustomers(filteredUsers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      showErrorAlert("Error", "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAll<ProductData>("/api/admin/products");
      if (response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      showErrorAlert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Update order items when currency changes
  useEffect(() => {
    if (orderItems.length > 0) {
      const updatedItems = orderItems.map((item) => {
        // Find the product to get variant price
        const product = products.find((p) => p._id === item.productId);
        if (!product) return item;

        const variant = product.productVariantsData?.find(
          (v) => v._id === item.variantId,
        );
        if (!variant) return item;

        const newBasePrice = variant.price[currency] || 0;

        // Update prices with new currency
        const updatedItem: IOrderDetail = {
          ...item,
          originalPrice: { [currency]: newBasePrice },
        };

        // Recalculate discounted price if discount exists
        if (item.discountPercentage && item.discountPercentage > 0) {
          const discountedPrice =
            newBasePrice - (newBasePrice * item.discountPercentage) / 100;
          updatedItem.discountedPrice = { [currency]: discountedPrice };
          updatedItem.subTotal = discountedPrice * item.quantity;
        } else {
          updatedItem.discountedPrice = undefined;
          updatedItem.subTotal = newBasePrice * item.quantity;
        }

        return updatedItem;
      });

      setOrderItems(updatedItems);
    }
  }, [currency]);

  // Select customer and populate shipping address
  const handleSelectCustomer = (customer: UserData) => {
    setSelectedCustomer(customer);

    // Set currency based on role
    if (customer.role === "retail") {
      setCurrency("IDR");
    } else if (
      customer.role === "reseller" &&
      customer.resellerCategory?.currency
    ) {
      setCurrency(customer.resellerCategory.currency as TCurrency);
    } else {
      setCurrency("IDR"); // Default fallback
    }

    console.log(customer, "????");

    // Populate shipping address from customer profile
    if (customer.role === "retail" && customer.retailProfile?.address) {
      setShippingAddress({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phoneNumber,
        country: customer.retailProfile.address.country || "",
        city: customer.retailProfile.address.city || "",
        district: customer.retailProfile.address.district || "",
        zipCode: customer.retailProfile.address.zipCode || "",
        address: customer.retailProfile.address.address || "",
      });
    } else if (
      customer.role === "reseller" &&
      customer.resellerProfile?.shippingAddress
    ) {
      setShippingAddress({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phoneNumber,
        country: customer.resellerProfile.shippingAddress.country || "",
        city: customer.resellerProfile.shippingAddress.city || "",
        district: customer.resellerProfile.shippingAddress.district || "",
        zipCode: customer.resellerProfile.shippingAddress.zipCode || "",
        address: customer.resellerProfile.shippingAddress.address || "",
      });
    } else {
      // Default to customer basic info
      setShippingAddress({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phoneNumber,
        country: "",
        city: "",
        district: "",
        zipCode: "",
        address: "",
      });
    }

    setShowCustomerModal(false);
  };

  // Open product modal
  const handleOpenProductModal = () => {
    if (!selectedCustomer) {
      showErrorAlert("Select Customer", "Please select a customer first");
      return;
    }
    setShowProductModal(true);
    fetchProducts();
  };

  // Select product and show variant selection
  const handleSelectProduct = (product: ProductData) => {
    setSelectedProduct(product);
    setShowVariantSelection(true);
  };

  // Add variant to order
  const handleAddVariant = (variantId: string) => {
    if (!selectedProduct) return;

    const variant = selectedProduct.productVariantsData?.find(
      (v) => v._id === variantId,
    );

    if (!variant) return;

    // Check if variant already exists
    const existingItem = orderItems.find(
      (item) => item.variantId === variantId,
    );
    if (existingItem) {
      showErrorAlert(
        "Already Added",
        "This product variant is already in the order.",
      );
      setShowVariantSelection(false);
      setShowProductModal(false);
      setSelectedProduct(null);
      return;
    }

    const quantity = 1;
    const basePrice = variant.price[currency] || 0;

    const tempItem: IOrderDetail = {
      productId: selectedProduct._id,
      productName: selectedProduct.productName,
      categoryId: selectedProduct.categoryId,
      variantId: variant._id,
      variantName: variant.name,
      sku: variant.sku,
      quantity: quantity,
      stock: variant.stock,
      preOrder: selectedProduct.preOrder,
      originalPrice: { [currency]: basePrice },
      discountedPrice: undefined,
      discountPercentage: undefined,
      image: variant.image || {
        imageUrl: "",
        imagePublicId: "",
      },
      subTotal: basePrice * quantity,
      moq: selectedProduct.moq,
    };

    setOrderItems([...orderItems, tempItem]);
    setShowVariantSelection(false);
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Update item quantity
  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    setOrderItems((items) =>
      items.map((item) => {
        if (item.variantId === variantId) {
          const currency = "USD";
          const price = item.discountedPrice
            ? item.discountedPrice[currency]
            : item.originalPrice[currency];
          return {
            ...item,
            quantity: newQuantity,
            subTotal: price * newQuantity,
          };
        }
        return item;
      }),
    );
  };

  // Update item field (for table inputs)
  const updateItemField = (
    index: number,
    field: "originalPrice" | "discountPercentage" | "discountedPrice",
    value: any,
  ) => {
    const newItems = [...orderItems];
    const item = newItems[index];

    if (field === "originalPrice") {
      if (!item.originalPrice) item.originalPrice = {};
      item.originalPrice[currency] = parseFloat(value) || 0;

      // Recalculate discount if exists
      if (item.discountPercentage && item.discountPercentage > 0) {
        const discountedPrice =
          item.originalPrice[currency] -
          (item.originalPrice[currency] * item.discountPercentage) / 100;
        if (!item.discountedPrice) item.discountedPrice = {};
        item.discountedPrice[currency] = discountedPrice;
        item.subTotal = discountedPrice * item.quantity;
      } else {
        item.subTotal = item.originalPrice[currency] * item.quantity;
      }
    } else if (field === "discountPercentage") {
      const discount = Math.max(0, Math.min(100, parseFloat(value) || 0));
      item.discountPercentage = discount;

      if (discount > 0) {
        const discountedPrice =
          item.originalPrice[currency] -
          (item.originalPrice[currency] * discount) / 100;
        if (!item.discountedPrice) item.discountedPrice = {};
        item.discountedPrice[currency] = discountedPrice;
        item.subTotal = discountedPrice * item.quantity;
      } else {
        item.discountedPrice = undefined;
        item.discountPercentage = undefined;
        item.subTotal = item.originalPrice[currency] * item.quantity;
      }
    } else if (field === "discountedPrice") {
      if (!item.discountedPrice) item.discountedPrice = {};
      const discountedPrice = parseFloat(value) || 0;
      item.discountedPrice[currency] = discountedPrice;

      // Recalculate discount percentage
      const originalPrice = item.originalPrice[currency];
      if (originalPrice > 0 && discountedPrice < originalPrice) {
        const discountAmount = originalPrice - discountedPrice;
        item.discountPercentage = (discountAmount / originalPrice) * 100;
      } else {
        item.discountPercentage = 0;
        item.discountedPrice = undefined;
      }

      item.subTotal =
        (item.discountedPrice?.[currency] || item.originalPrice[currency]) *
        item.quantity;
    }

    setOrderItems(newItems);
  };

  // Remove item
  const handleRemoveItem = (variantId: string) => {
    setOrderItems((items) =>
      items.filter((item) => item.variantId !== variantId),
    );
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.subTotal, 0);
    return subtotal + shippingCost - discountShipping;
  };

  // Submit order
  const handleSubmit = async () => {
    if (!selectedCustomer) {
      showErrorAlert("Error", "Please select a customer");
      return;
    }

    if (orderItems.length === 0) {
      showErrorAlert("Error", "Please add at least one product");
      return;
    }

    if (!shippingAddress.address || !shippingAddress.country) {
      showErrorAlert("Error", "Please complete the shipping address");
      return;
    }

    try {
      setSaving(true);

      const orderData: OrderForm = {
        orderDate: new Date(),
        invoiceNumber: `INV-${Date.now()}`, // Temporary, will be generated by backend
        totalAmount: orderItems.reduce((sum, item) => sum + item.subTotal, 0),
        status: "pending confirmation",
        orderType: selectedCustomer.role === "reseller" ? "B2B" : "B2C",
        shippingAddress,
        orderDetails: orderItems,
        shippingCost,
        discountShipping,
        currency,
      };

      const response = await createData("/api/admin/orders", orderData);

      if (response.success) {
        showSuccessAlert("Success", "Order created successfully");
        router.push("/dashboard/orders");
      }
    } catch (error: any) {
      console.error("Failed to create order:", error);
      showErrorAlert("Error", error.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName
        .toLowerCase()
        .includes(customerSearchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()),
  );

  if (loading && customers.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Order</h1>
      </div>

      {/* Customer Selection */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Customer</h2>
          </div>
          <Button onClick={() => setShowCustomerModal(true)} size="sm">
            {selectedCustomer ? "Change Customer" : "Select Customer"}
          </Button>
        </div>

        {selectedCustomer ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-lg">
            <div>
              <Label className="text-sm text-gray-600">Name</Label>
              <p className="font-medium">{selectedCustomer.fullName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="font-medium">{selectedCustomer.email}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Role</Label>
              <p className="font-medium capitalize">{selectedCustomer.role}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Currency</Label>
              <Select
                value={currency}
                onValueChange={(value) => setCurrency(value as TCurrency)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SGD">SGD</SelectItem>
                  <SelectItem value="IDR">IDR</SelectItem>
                  <SelectItem value="HKD">HKD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No customer selected. Click "Select Customer" to choose one.
          </p>
        )}
      </div>

      {/* Shipping Address & Order Summary Grid */}
      {selectedCustomer && (
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
                      setShippingAddress({
                        ...shippingAddress,
                        fullName: e.target.value,
                      })
                    }
                    value={shippingAddress.fullName}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>Email *</span>
                  </Label>
                  <Input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        email: e.target.value,
                      })
                    }
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
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        phone: e.target.value,
                      })
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
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        country: e.target.value,
                      })
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    City *
                  </Label>
                  <Input
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    District *
                  </Label>
                  <Input
                    value={shippingAddress.district}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        district: e.target.value,
                      })
                    }
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Zip Code *
                  </Label>
                  <Input
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        zipCode: e.target.value,
                      })
                    }
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
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      address: e.target.value,
                    })
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                  required
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>

            <div className="space-y-4">
              {/* Subtotal Display */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {currencyFormat(
                    orderItems.reduce((sum, item) => sum + item.subTotal, 0),
                    currency,
                  )}
                </span>
              </div>

              {/* Shipping Cost Input */}
              <div>
                <Label className="mb-2">Shipping Cost *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) =>
                    setShippingCost(parseFloat(e.target.value) || 0)
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                />
              </div>

              {/* Discount Shipping Input */}
              <div>
                <Label className="mb-2">Discount Shipping</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountShipping}
                  onChange={(e) =>
                    setDiscountShipping(parseFloat(e.target.value) || 0)
                  }
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-4"
                />
              </div>

              {/* Total Display */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-primary">
                  {currencyFormat(calculateTotal(), currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      {selectedCustomer && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Order Items</h2>
              </div>
              <p className="text-gray-600 mt-1">
                {orderItems.length} item(s) in this order
              </p>
            </div>
            <Button onClick={handleOpenProductModal} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {orderItems.length > 0 ? (
            <div className="overflow-x-auto rounded-xl">
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
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orderItems.map((item, index) => (
                    <tr
                      key={item.variantId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image.imageUrl || "/placeholder.png"}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-sm mb-1">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500 mb-1.5">
                              SKU: {item.sku || "-"}
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
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.variantId,
                                parseInt(e.target.value) || 1,
                              )
                            }
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
                            value={item.originalPrice[currency] || 0}
                            onChange={(e) =>
                              updateItemField(
                                index,
                                "originalPrice",
                                e.target.value,
                              )
                            }
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
                            value={item.discountPercentage || 0}
                            onChange={(e) =>
                              updateItemField(
                                index,
                                "discountPercentage",
                                e.target.value,
                              )
                            }
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
                            value={item.discountedPrice?.[currency] || 0}
                            onChange={(e) =>
                              updateItemField(
                                index,
                                "discountedPrice",
                                e.target.value,
                              )
                            }
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
                            disabled
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleRemoveItem(item.variantId)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
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
                    <td className="px-6 py-4 text-right" colSpan={2}>
                      <span className="font-bold text-primary">
                        {currencyFormat(
                          orderItems.reduce(
                            (sum, item) => sum + item.subTotal,
                            0,
                          ),
                          currency,
                        )}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No items added. Click "Add Product" to start.
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {selectedCustomer && (
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/orders")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || orderItems.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Creating..." : "Create Order"}
          </Button>
        </div>
      )}

      {/* Customer Selection Modal */}
      <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer._id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{customer.fullName}</h3>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                      <p className="text-sm text-gray-500">
                        {customer.phoneNumber}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                      {customer.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Selection Modal */}
      <ProductSelectorModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
        loadingProducts={loading}
      />

      {/* Variant Selection Modal */}
      <VariantSelectorModal
        isOpen={showVariantSelection}
        onClose={() => setShowVariantSelection(false)}
        product={selectedProduct}
        onSelectVariant={handleAddVariant}
        currency={currency}
      />
    </div>
  );
}
