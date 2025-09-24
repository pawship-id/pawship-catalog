"use client";
import React, { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Heart,
  Star,
  Truck,
  Mail,
  User,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  inStock: boolean;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
}

const CartPage = () => {
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
  });

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isAddressValid = () => {
    return Object.values(shippingAddress).every((value) => value.trim() !== "");
  };

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Premium Dog Sweater",
      price: 29.99,
      originalPrice: 39.99,
      image:
        "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=300",
      size: "Medium",
      color: "Navy Blue",
      quantity: 1,
      inStock: true,
    },
    {
      id: 2,
      name: "Cat Collar with Bell",
      price: 15.99,
      image:
        "https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=300",
      size: "Small",
      color: "Pink",
      quantity: 2,
      inStock: true,
    },
    {
      id: 3,
      name: "Luxury Pet Bed",
      price: 89.99,
      image:
        "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=300",
      size: "Large",
      color: "Beige",
      quantity: 1,
      inStock: false,
    },
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-400 to-rose-400 p-6 sm:p-8 rounded-full inline-flex mb-6 sm:mb-8">
            <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-6 sm:mb-8 px-4">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Cart Items Section */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-primary/30 overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Cart Items
                  </h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-4">
                      {/* Desktop Cart Item - Full size for >= 750px */}
                      <div className="hidden min-[750px]:flex items-start space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-30 h-30 object-cover rounded-lg"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {item.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span>Size: {item.size}</span>
                            <span>Color: {item.color}</span>
                          </div>

                          {!item.inStock ? (
                            <div className="text-red-600 text-sm font-medium mb-2">
                              Out of Stock
                            </div>
                          ) : (
                            <div className="text-orange-600 text-sm font-medium mb-2">
                              Pre-Order
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-800">
                                ${item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${item.originalPrice}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="p-2 hover:bg-gray-100 transition-colors"
                                  disabled={!item.inStock}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-2 font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="p-2 hover:bg-gray-100 transition-colors"
                                  disabled={!item.inStock}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Compact Desktop Cart Item - For >= 416px && < 750px */}
                      <div className="hidden min-[416px]:max-[750px]:flex items-start space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-25 h-25 object-cover rounded-lg"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-800 mb-1">
                            {item.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                            <span>Size: {item.size}</span>
                            <span>Color: {item.color}</span>
                          </div>

                          {!item.inStock ? (
                            <div className="text-red-600 text-xs font-medium mb-2">
                              Out of Stock
                            </div>
                          ) : (
                            <div className="text-orange-600 text-xs font-medium mb-2">
                              Pre-order
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-base font-bold text-gray-800">
                                ${item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  ${item.originalPrice}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="p-1 hover:bg-gray-100 transition-colors"
                                  disabled={!item.inStock}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2 py-1 font-medium text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="p-1 hover:bg-gray-100 transition-colors"
                                  disabled={!item.inStock}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Cart Item - Only show on screens <= 415px */}
                      <div className="block min-[416px]:hidden">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="w-25 h-25 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            {/* Product Name with overflow hidden */}
                            <h3 className="text-sm font-semibold text-gray-800 truncate">
                              {item.name}
                            </h3>

                            {/* Variant Name with overflow hidden and smaller text */}
                            <div className="text-xs text-gray-600 truncate">
                              {item.size} • {item.color}
                            </div>

                            {/* Price */}
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-gray-800">
                                ${item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  ${item.originalPrice}
                                </span>
                              )}
                            </div>

                            {/* Stock Status */}
                            <div>
                              {!item.inStock ? (
                                <span className="text-xs text-red-600 font-medium">
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="text-xs text-orange-600 font-medium">
                                  Pre-order
                                </span>
                              )}
                            </div>

                            {/* Bottom Row: Quantity Controls and Delete Button */}
                            {/* <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="p-1.5 hover:bg-gray-100 transition-colors"
                                  disabled={!item.inStock}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2 py-1.5 font-medium text-sm min-w-[32px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="p-1.5 hover:bg-gray-100 transition-colors"
                                  disabled={!item.inStock}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div> */}
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="p-1 hover:bg-gray-100 transition-colors"
                                  disabled={!item.inStock}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2 py-1 font-medium text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="p-1 hover:bg-gray-100 transition-colors"
                                  disabled={!item.inStock}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-primary/30">
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Shipping Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) =>
                        handleAddressChange("fullName", e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/80 focus:border-primary/80 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) =>
                        handleAddressChange("email", e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/80 focus:border-primary/80 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        handleAddressChange("phone", e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/80 focus:border-primary/80 transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Province
                    </label>
                    <select
                      value={shippingAddress.province}
                      onChange={(e) =>
                        handleAddressChange("province", e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/80 focus:border-primary/80 transition-colors"
                    >
                      <option value="">Select Province</option>
                      <option value="DKI Jakarta">DKI Jakarta</option>
                      <option value="West Java">West Java</option>
                      <option value="Central Java">Central Java</option>
                      <option value="East Java">East Java</option>
                      <option value="Bali">Bali</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      City
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/80 focus:border-primary/80 transition-colors"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        handleAddressChange("postalCode", e.target.value)
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/80 focus:border-primary/80 transition-colors"
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Street Address
                    </label>
                    <textarea
                      value={shippingAddress.address}
                      onChange={(e) =>
                        handleAddressChange("address", e.target.value)
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/80 focus:border-primary/80 transition-colors resize-none"
                      placeholder="Enter your complete address"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-primary/30 lg:sticky lg:top-4">
              <div className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{formatCurrency(shipping)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-800">
                      <span>Total</span>
                      {formatCurrency(total)}
                    </div>
                  </div>
                </div>

                <button
                  className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg ${
                    cartItems.length === 0 || !isAddressValid()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary/90 hover:bg-primary text-white transform hover:scale-105"
                  }`}
                  disabled={cartItems.length === 0 || !isAddressValid()}
                >
                  {!isAddressValid()
                    ? "Complete Address to Continue"
                    : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
