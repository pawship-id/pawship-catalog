"use client";
import ErrorPublicPage from "@/components/error-public-page";
import LoadingPage from "@/components/loading";
import { Button } from "@/components/ui/button";
import { getById } from "@/lib/apiService";
import { currencyFormat } from "@/lib/helpers";
import { OrderData } from "@/lib/types/order";
import { CheckCircle, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

/** Reseller (B2B) orders go to the reseller line, retail (B2C) to the retail line. */
const WA_NUMBER = {
  B2B: "628158843760",
  B2C: "6281231351150",
} as const;

export default function OrderSuccess() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(order?.orderDetails);

  const handleConfirmViaWA = () => {
    const items = order?.orderDetails
      .map(
        (el) =>
          `• ${el.quantity}x ${el.productName} ${el.variantName} ${el.sku ? `(SKU: ${el.sku})` : "(SKU: -)"} : ${currencyFormat(el.subTotal, order.currency)}`
      )
      .join("\n");

    // A pickup order has no delivery address and no shipping fee to quote, so
    // the message asks about the pickup schedule instead.
    const isPickup = !!order?.isPickup;

    const deliveryLines = isPickup
      ? `*Delivery Method:* Pickup at store`
      : `*Delivery Method:* Delivery
*Address:* ${order?.shippingAddress.address}
*Shipping Fee:* _Not available yet_`;

    const closing = isPickup
      ? `Please confirm my pickup schedule & payment details.`
      : `Please confirm my shipping fee & payment details.`;

    const msg = `
*Hi Pawship!*

I just placed an order on your website.
Here are my details:

*Name:* ${order?.shippingAddress.fullName}
*Phone:* ${order?.shippingAddress.phone}
${deliveryLines}

*Items:*
${items}

${closing}
Thank you!
`;

    const encodedMsg = encodeURIComponent(msg.trim());
    const phone = WA_NUMBER[order?.orderType === "B2B" ? "B2B" : "B2C"];
    window.open(`https://wa.me/${phone}?text=${encodedMsg}`, "_blank");
  };

  const fetchOrderById = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<OrderData>("/api/public/orders", id);

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
    fetchOrderById();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPublicPage errorMessage={error} />;
  }

  if (!order) {
    return <ErrorPublicPage errorMessage="Page Not Found" />;
  }

  if (order.status !== "pending confirmation") {
    return (
      <div className="flex items-center justify-center py-16 px-6 sm:px-8">
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-green-100 transition duration-300 ease-in-out">
          <div className="text-center space-y-8">
            {/* Ikon Sukses */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center shadow-xl">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
                Payment Confirmed
              </h1>
              <p className="text-base md:text-lg text-gray-700 px-2 font-semibold">
                Order ID: {order.invoiceNumber}
              </p>
              <p className="text-base md:text-lg text-gray-500 px-2">
                Your order has been successfully confirmed and is being
                processed.
              </p>
            </div>

            <div className="pt-2">
              <Button
                className="w-full inline-flex items-center justify-center gap-2 py-3 h-12 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out cursor-pointer"
                asChild
              >
                <Link href={"/catalog"} className="text-lg">
                  <ShoppingCart className="w-5 h-5" />
                  Shop Now
                </Link>
              </Button>
            </div>

            <a
              href={`/orders/${order.invoiceNumber}`}
              className="text-sm font-medium text-gray-500 hover:text-green-500 transition duration-200"
            >
              View Order Details
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16 px-6 sm:px-8">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-green-100 transition duration-300 ease-in-out">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
              Order Placed Successfully
            </h1>
            <p className="text-base md:text-lg text-gray-700 px-2 font-semibold">
              Your Order ID: {order.invoiceNumber}
            </p>
            <p className="text-base md:text-lg text-gray-500 px-2">
              {order.isPickup
                ? "We'll confirm your pickup schedule & payment via WhatsApp"
                : "We'll confirm shipping & payment via WhatsApp"}
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleConfirmViaWA}
              className="w-full inline-flex items-center justify-center gap-2 py-3 h-12 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out cursor-pointer"
            >
              Confirm via WhatsApp
            </Button>
          </div>
          <a
            href={`/my-orders/${order._id}`}
            className="text-sm font-medium text-gray-500 hover:text-green-500 transition duration-200"
          >
            View Order Details
          </a>
        </div>
      </div>
    </div>
  );
}
