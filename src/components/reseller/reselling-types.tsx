"use client";
import React from "react";
import { CheckCircle, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResellingTypes() {
  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      "Hi I'm interested to be your reseller!"
    );
    const phone = "+628"; // Replace with actual phone number
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-5">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Reselling Types
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#F79985] to-[#FCBE87] mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto py-8">
          {/* Starter Package */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-primary/90 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <Package className="h-8 w-8 text-primary/80 mr-3" />
              <h3 className="text-2xl font-bold text-gray-800">
                Starter Package
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Perfect for testing the market or starting a new business
            </p>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                Choose from our existing best-selling designs
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                Discounts up to 30%
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                Minimum order starts from 10 pcs only
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                Wide variation of models and sizes
              </li>
            </ul>

            <Button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-gradient-to-r from-[#FBBD86] to-primary text-white py-6 rounded-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-lg mt-auto"
            >
              Join Now!
            </Button>
          </div>

          {/* White-Labeling */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-primary/90 relative overflow-hidden flex flex-col h-full">
            <div className="flex items-center mb-4">
              <Star className="h-8 w-8 text-primary/80 mr-3" />
              <h3 className="text-2xl font-bold text-gray-800">
                White-Labeling
              </h3>
            </div>
            <p className="text-gray-600 mb-6 font-medium">
              Build your own brand!
            </p>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                Create your own design with our team
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                Exclusive reseller pricing
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                MOQ starts from 35 pcs
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                Designs stay exclusive to your brand
              </li>
            </ul>

            <Button
              asChild
              className="w-full bg-gradient-to-r from-primary to-[#FBBD86] text-white py-6 rounded-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-lg mt-auto"
            >
              <Link href="reseller/white-labeling">Consult Now!</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
