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
    <section className="pt-10 pb-20">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">
            Reselling Types
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the reselling model that best fits your goals — from simple
            entry-level options to full brand customization.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Starter Package */}
          <div className="bg-white border-1 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
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
              className="w-full bg-gradient-to-r from-[#FBBD86] to-primary text-white py-6 rounded-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-lg mt-auto cursor-pointer"
            >
              Join Now!
            </Button>
          </div>

          {/* White-Labeling */}
          <div className="bg-secondary border-2 border-primary/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col h-full hover:-translate-y-1">
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
                <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                Create your own design with our team
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                Exclusive reseller pricing
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                MOQ starts from 35 pcs
              </li>
              <li className="flex items-center text-gray-700">
                <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
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
