"use client";
import React, { useState } from "react";
import { X, Send, UserPlus, ArrowRight } from "lucide-react";
import StepCard from "./step-card";
import { Button } from "../ui/button";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Apply for Reseller Account",
      description:
        "Sign up and get your reseller credentials. We'll verify and onboard you.",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnDMdLG5I9N686f1aW8pEber0-CJN2PhWKUA&s",
    },
    {
      id: 2,
      title: "Get Approved",
      description:
        "Receive details of your discount tier, MOQ, and reseller benefits",
      image:
        "https://image.made-in-china.com/2f0j00FYEbKNQcnWkq/School-Style-New-Design-Cute-Dog-Clothes-Princess-Dog-Dresses-Pet-Products.webp",
    },
    {
      id: 3,
      title: "Explore Catalog with Reseller Prices",
      description:
        "Log in anytime to view catalog, updated price lists, and reseller-only discounts directly on our website.",
      image:
        "https://image.made-in-china.com/202f0j00ZOYltruPTTgf/Cute-Print-Small-Dog-Hoodie-Coat-Winter-Warm-Dog-Clothes.webp",
    },
    {
      id: 4,
      title: "Place your Order",
      description:
        "Order products with reseller pricing, stock up, and grow your business with us.",
      image:
        "https://s.alicdn.com/@sc04/kf/Hc234b60631fc4dc48787790e68b57e09e.jpg_300x300.jpg",
    },
    {
      id: 5,
      title: "Start Selling",
      description: "Place your order, receive your goods and start selling!",
      image:
        "https://down-id.img.susercontent.com/file/id-11134207-7r98x-lw40kvdsbfl83b",
    },
  ];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    ownerName: "",
    country: "",
    email: "",
    phoneNumber: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hi I'm interested to be your reseller!

Store Name: ${formData.storeName}
Owner Name: ${formData.ownerName}
Country: ${formData.country}
Email: ${formData.email}
Phone: ${formData.phoneNumber}`;

    const whatsappUrl = `https://wa.me/+62?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setShowForm(false);
  };

  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">How it Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From idea to delivery, here’s how we bring your brand vision to life
            — step by step.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-x-auto pb-6 scrollbar-hide">
            <div className="flex gap-6 w-max">
              {steps.map((step, idx) => (
                <StepCard key={idx} step={step} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-[#F69784] to-[#FBBD87] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center w-full max-w-xs sm:max-w-none sm:w-auto cursor-pointer hover:scale-105"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Apply Now</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-salmon-800">
              Apply for Reseller Account
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  name="storeName"
                  autoFocus
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 focus:border-transparent"
                  required
                />
              </div>

              <button className="w-full bg-gradient-to-r from-[#F79985] to-[#FCBE87] hover:scale-105 text-white font-semibold py-3 rounded-lg text-base transition-colors duration-300">
                Send to WhatsApp
                <Send className="inline h-5 w-5 ml-2 rotate-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* Internet Explorer 10+ */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
    </section>
  );
}
