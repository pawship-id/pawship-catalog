"use client";
import HowItWorks from "@/components/reseller/HowItWorks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { whyTrustUsContents } from "@/lib/data/reseller";
import { CheckCircle, Package, Star, UserPlus } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ResellerPage() {
  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      "Hi I'm interested to be your reseller!"
    );
    const phone = "1234567890"; // Replace with actual phone number
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-[60vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/1200x/03/39/9c/03399c4203de344d134f0d78c1a35840.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Overlay hitam */}
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-primary text-primary-foreground">
              Reseller
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold">
              Become Our{" "}
              <span className="text-primary">Exclusive Reseller</span>
              <br />
            </h1>
            <p className="text-lg lg:text-xl">
              Join our growing family of trusted partners bringing quality pet
              clothing & accessories worldwide.
            </p>
            <Button
              size="lg"
              className="inline-flex items-center gap-3 bg-white text-primary px-8 py-6 rounded-full text-base font-semibold hover:bg-white/95 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <UserPlus size={26} />
              Join Now
            </Button>
          </div>
        </div>
      </section>

      {/* Why Trust Us? */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-4 text-center mb-4">
            <h2 className="text-3xl font-bold text-foreground">
              Why Trust Us?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
            {whyTrustUsContents.map((item, idx) => {
              let Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 group"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(to right, #F69784, #FBBD87)`,
                    }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.subTitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reselling Types */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="space-y-4 text-center mb-4">
            <h2 className="text-3xl font-bold text-foreground">
              Reselling Types
            </h2>
            {/* <div className="w-24 h-1 bg-gradient-to-r from-[#F79985] to-[#FCBE87] mx-auto"></div> */}
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

      <HowItWorks />
    </div>
  );
}
