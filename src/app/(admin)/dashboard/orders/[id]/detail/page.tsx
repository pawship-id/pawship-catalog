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
  BanknoteArrowDown,
  Download,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const generateInvoicePDF = () => {
    if (!order) return;

    const doc = new jsPDF();

    // Template data mapping from order
    const templateData = {
      invoice: order.invoiceNumber,
      nama: order.shippingAddress.fullName,
      date: new Date(order.orderDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      address: `${order.shippingAddress.address}${
        order.shippingAddress.address
          ? ", " + order.shippingAddress.address
          : ""
      }\n${order.shippingAddress.city}, ${order.shippingAddress.country} ${order.shippingAddress.zipCode}`,
      phone_number: order.shippingAddress.phone,
      email: order.shippingAddress.email || "",
      currency: order.currency.toUpperCase(),
      items: order.orderDetails.map((item) => {
        const originalPrice = item.originalPrice[order.currency];
        const quantity = item.quantity;
        const subTotal = originalPrice * quantity;
        const discountPercentage = item.discountPercentage || 0;
        const totalDiscount = (subTotal * discountPercentage) / 100;
        const totalAmount = subTotal - totalDiscount;

        return {
          sku: item.sku || "-",
          qty: quantity,
          originalPrice: currencyFormat(originalPrice, order.currency),
          subTotal: currencyFormat(subTotal, order.currency),
          discount: `${discountPercentage}%`,
          totalDiscount: currencyFormat(totalDiscount, order.currency),
          totalAmount: currencyFormat(totalAmount, order.currency),
        };
      }),
    };

    // Blue header bar (matching template color #002b79)
    doc.setFillColor(0, 43, 121);
    doc.rect(0, 0, 210, 55, "F");

    // Invoice Title (left side, white text, large)
    doc.setFontSize(35);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Invoice", 14, 25);

    // Add company logo (white background box with logo)
    doc.setFillColor(255, 255, 255);
    doc.rect(14, 30, 40, 20, "F");
    try {
      doc.addImage("/images/transparent-logo.png", "PNG", 19, 33, 30, 14);
    } catch (error) {
      console.error("Error loading logo:", error);
    }

    // Company Information (right side, white text)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Pawship Indonesia", 196, 18, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Klampis Jaya A6, Surabaya", 196, 25, { align: "right" });
    doc.text("+62 815 8843 760", 196, 38, { align: "right" });
    doc.text("pawship.id@gmail.com", 196, 45, { align: "right" });

    // Back to black text for body content
    doc.setTextColor(0, 0, 0);

    // Invoice Details Section (left)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE DETAILS:", 14, 68);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Invoice #", 14, 75);
    doc.text(order.invoiceNumber, 50, 75);

    doc.text("Date of Issue", 14, 82);
    doc.text(
      new Date(order.orderDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      50,
      82,
    );

    // Bill To Section (right side)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 120, 68);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(order.shippingAddress.fullName, 120, 75);

    // Address
    const fullAddress = `${order.shippingAddress.address}${
      order.shippingAddress.address ? ", " + order.shippingAddress.district : ""
    }, ${order.shippingAddress.city}, ${order.shippingAddress.country} ${order.shippingAddress.zipCode}`;
    const addressLines = doc.splitTextToSize(fullAddress, 75);
    let addressY = 81;
    addressLines.forEach((line: string) => {
      doc.text(line, 120, addressY);
      addressY += 5;
    });

    doc.text(order.shippingAddress.phone, 120, addressY);
    addressY += 5;
    if (order.shippingAddress?.email) {
      doc.text(order.shippingAddress.email, 120, addressY);
      addressY += 5;
    }
    doc.text(order.currency.toUpperCase(), 120, addressY);

    // Line separator before table (full width, blue color)
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 43, 121);
    doc.line(0, 105, 210, 105);

    // Items table
    const tableStartY = 110;
    const tableData = order.orderDetails.map((item) => {
      const originalPrice = item.originalPrice[order.currency];
      const quantity = item.quantity;
      const subTotal = originalPrice * quantity;
      const discountPercentage = item.discountPercentage || 0;
      const totalDiscount = (subTotal * discountPercentage) / 100;
      const totalAmount = subTotal - totalDiscount;

      return [
        item.sku || "-",
        quantity.toString(),
        currencyFormat(originalPrice, order.currency),
        currencyFormat(subTotal, order.currency),
        `${discountPercentage}%`,
        currencyFormat(totalDiscount, order.currency),
        currencyFormat(totalAmount, order.currency),
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [
        ["ITEM", "QTY", "PRICE", "TOTAL", "DISC", "TOTAL DISC", "TOTAL AMOUNT"],
      ],
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineColor: [0, 43, 121],
        lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 },
        halign: "left",
      },
      bodyStyles: {
        lineColor: [0, 43, 121],
        lineWidth: { top: 0.1, bottom: 0.1, left: 0, right: 0 },
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 18, halign: "center" },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 18, halign: "center" },
        5: { cellWidth: 28, halign: "center" },
        6: { cellWidth: 32, halign: "center" },
      },
    });

    // Calculate total discount from all items
    const totalDiscountAmount = order.orderDetails.reduce((sum, item) => {
      const originalPrice = item.originalPrice[order.currency];
      const quantity = item.quantity;
      const subTotal = originalPrice * quantity;
      const discountPercentage = item.discountPercentage || 0;
      const itemDiscount = (subTotal * discountPercentage) / 100;
      return sum + itemDiscount;
    }, 0);

    // Get the final Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Left side - TERMS section
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS", 14, finalY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(
      "All payments should be deposited before shipping",
      14,
      finalY + 6,
    );

    // Right side - Summary section
    const summaryX = 120;
    let summaryY = finalY;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Subtotal
    doc.text("Subtotal", summaryX, summaryY);
    doc.text(
      order.currency === "usd"
        ? `$${order.totalAmount.toFixed(2)}`
        : currencyFormat(order.totalAmount, order.currency),
      196,
      summaryY,
      { align: "right" },
    );

    summaryY += 6;

    // Discount
    doc.text("Discount", summaryX, summaryY);
    doc.text(
      currencyFormat(totalDiscountAmount, order.currency),
      196,
      summaryY,
      {
        align: "right",
      },
    );

    summaryY += 6;

    // Tax
    doc.setFont("helvetica", "bold");
    doc.text("Tax", summaryX, summaryY);
    doc.text(currencyFormat(0, order.currency), 196, summaryY, {
      align: "right",
    });

    summaryY += 8;

    // Total
    doc.setFontSize(10);
    doc.text("TOTAL", summaryX, summaryY);
    const finalTotal =
      order.totalAmount + order.shippingCost - (order.discountShipping || 0);
    doc.text(currencyFormat(finalTotal, order.currency), 196, summaryY, {
      align: "right",
    });

    // Conditions/Instructions (left side, below TERMS)
    const conditionsY = finalY + 20;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("CONDITIONS/INTRUCTIONS", 14, conditionsY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Payment can be deposited to", 14, conditionsY + 6);
    doc.text("BCA Yosefina Angelita", 14, conditionsY + 10);
    doc.text("1520675597", 14, conditionsY + 14);

    // Bottom blue bar (matching template)
    doc.setFillColor(0, 43, 121);
    doc.rect(0, 275, 210, 22, "F");

    // Save PDF
    doc.save(`Invoice-${order.invoiceNumber}.pdf`);
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

        {order && (
          <div className="flex gap-4">
            {getStatusBadge(order.status)}

            <Button
              size="sm"
              // variant="outline"
              className="cursor-pointer"
              onClick={generateInvoicePDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>

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
                        order.currency,
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
                                },
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
                                "Are you sure you want to delete this payment proof?",
                              )
                            )
                              return;
                            try {
                              const res = await fetch(
                                `/api/orders/payment-proof/${id}?imagePublicId=${encodeURIComponent(
                                  proof.imagePublicId,
                                )}`,
                                { method: "DELETE" },
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
                              <p className="font-semibold text-sm mb-1 text-foreground">
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
                        <td className="px-6 py-4 text-center">
                          <span className="text-foreground">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-foreground">
                            {currencyFormat(
                              item.originalPrice[order.currency],
                              order.currency,
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
                                order.currency,
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
