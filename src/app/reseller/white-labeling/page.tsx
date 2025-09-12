"use client";
import FinalCTA from "@/components/reseller/white-labeling/final-cta";
import Testimonial from "@/components/reseller/white-labeling/testimonial";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Factory,
  MessageSquare,
  Package,
  Palette,
  PencilRuler,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function WhiteLabellingPage() {
  const whyPawshipContents = [
    {
      id: 1,
      title: "Exclusive Customization",
      description:
        "From fabric selection to final finishing, design collections that truly reflect your brand’s style.",
      icon: Palette,
    },
    {
      id: 2,
      title: "Fast & Flexible Production",
      description: "Small MOQ, and scale as your brand grows.",
      icon: Zap,
    },
    {
      id: 3,
      title: "End-to-End Support",
      description:
        "From consultation and sampling to production and delivery, we guide you every step of the way.",
      icon: Package,
    },
    {
      id: 4,
      title: "Trusted Quality",
      description:
        "Our craftsmanship is trusted by resellers worldwide—your brand deserves the same.",
      icon: Sparkles,
    },
  ];

  const steps = [
    {
      id: 1,
      icon: MessageSquare,
      title: "Consultation",
      description:
        "Share your vision, target market, and style preferences with our team.",
    },
    {
      id: 2,
      icon: PencilRuler,
      title: "Design & Sampling",
      description:
        "We create tailored designs or adapt from our catalog. You’ll receive samples to review before production.",
    },
    {
      id: 3,
      icon: Factory,
      title: "Production",
      description:
        "Once approved, our expert team manufactures your collection with your brand tag.",
    },
    {
      id: 4,
      icon: Truck,
      title: "Delivery",
      description:
        "Receive your branded products, ready to sell to your customers.",
    },
    {
      id: 5,
      icon: TrendingUp,
      title: "Grow Together",
      description:
        "Continue scaling your brand with new drops, seasonal collections, or custom collaborations.",
    },
  ];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    brandName: "",
    ownerName: "",
    phoneNumber: "",
    service: "",
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
    let message = `Hi, I'm ${formData.ownerName}, interested in your White Labeling Service. My phone is ${formData.phoneNumber}.`;

    if (formData.brandName) {
      message += ` Brand: ${formData.brandName}.`;
    }

    const whatsappUrl = `https://wa.me/628158843760?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
    setShowForm(false);
    setFormData({
      brandName: "",
      ownerName: "",
      phoneNumber: "",
      service: "",
    });
  };

  return (
    <>
      {/* Hero Banner  */}
      <section className="relative min-h-[calc(100vh-115px)] md:min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-100px)] min-w-screen bg-gradient-to-br from-orange-100 via-white to-orange-50 overflow-hidden flex">
        <div className="relative max-w-7xl mx-auto flex">
          <div className="text-center flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-6">
              <span className="inline-flex items-center">
                <Sparkles className="w-8 h-8 lg:w-12 lg:h-12 text-primary mr-4" />
                Build Your Own Pet Brand
                <Sparkles className="w-8 h-8 lg:w-12 lg:h-12 text-primary ml-4" />
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#F69784] to-[#FBBD87] bg-clip-text text-transparent">
                with Us
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Turn your vision into reality with our exclusive white-label
              service. Customize our premium pet clothing & accessories with
              your own brand identity.
            </p>

            <button className="bg-gradient-to-r from-[#F69784] to-[#FBBD87] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center mx-auto">
              <ArrowRight className="w-5 h-5 mr-2" />
              Book a Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Why White-Label with us? */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-4 text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">
              Why White-Label with Us?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to launch and scale your pet brand
              successfully
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {whyPawshipContents.map((item, idx) => {
              let Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 group "
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(to right, #F69784, #FBBD87)`,
                    }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works? */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-3xl font-bold text-foreground">How it Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five simple steps to launch your own pet brand
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {steps.map((step, idx) => {
                let Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-15 h-15 bg-gradient-to-r from-[#F79985] to-[#FCBE87] rounded-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {step.id}. {step.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button className="bg-gradient-to-r from-[#F69784] to-[#FBBD87] text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center w-full max-w-xs sm:max-w-none sm:w-auto">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">
                Start Your Consultation
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-4 text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">
              Choose Your Package
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the perfect white-label solution for your brand
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Basic Package */}
            <div className="bg-white border-1 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <Package className="h-8 w-8 text-primary/80 mr-3" />
                <h3 className="text-2xl font-bold text-foreground">
                  Basic White Label
                </h3>
              </div>

              <p className="text-gray-600 mb-6">Perfect for getting started</p>

              <div className="space-y-3 mb-10">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">MOQ 30 pcs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">
                    Choose from our existing designs
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Add your brand label</span>
                </div>
              </div>

              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-to-r from-[#F69784] to-[#FBBD87] text-white py-6 rounded-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-lg mt-auto"
              >
                Join Now!
              </Button>
            </div>

            {/* Custom Package */}
            <div className="bg-secondary border-2 border-primary/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Custom White Label
                </h3>
                <p className="text-gray-600">Complete brand customization</p>
              </div> */}
              <div className="flex items-center mb-4">
                <Star className="h-8 w-8 text-primary/80 mr-3" />
                <h3 className="text-2xl font-bold text-gray-800">
                  Custom White Label
                </h3>
              </div>

              <p className="text-gray-600 mb-6 font-medium">
                Complete brand customization
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">
                    Fully original designs, exclusive to your brand
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">
                    Custom materials, patterns, and detailing
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">
                    Higher MOQ for bespoke production
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-to-r from-[#F69784] to-[#FBBD87] text-white py-6 rounded-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-lg mt-auto"
              >
                Join Now!
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Testimonial />

      <FinalCTA />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-3 text-gray-800">
                <span className="inline-flex items-center">
                  <Sparkles className="w-6 h-6 text-primary mr-2" />
                  Start Your Journey With Us
                  <Sparkles className="w-6 h-6 text-primary ml-2" />
                </span>
              </h3>
              <p className="text-gray-600 mb-2">
                Fill in a few details below so we can guide you better.
              </p>
              <p className="text-sm text-gray-500 italic">
                No commitments yet — just a first step to explore opportunities
                with us.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  name="brandName"
                  autoFocus
                  value={formData.brandName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                  <span className="text-gray-400 text-xs">
                    {" "}
                    (include country code)
                  </span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+62 812 3456 7890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Service <span className="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a service</option>
                  <option value="reseller">Reseller Basic</option>
                  <option value="whitelabel">White Labeling</option>
                </select>
              </div>

              <button className="w-full bg-gradient-to-r from-[#F79985] to-[#FCBE87] hover:scale-105 text-white font-semibold py-3 rounded-lg text-base transition-all duration-300 shadow-lg">
                Let's Talk
                <MessageSquare className="inline h-5 w-5 ml-2" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
