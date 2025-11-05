"use client";
import SingleBanner from "@/components/common/single-banner";
import CTAForm from "@/components/reseller/cta-form";
import StepCard from "@/components/reseller/step-card";
import FinalCTA from "@/components/reseller/white-labeling/final-cta";
import Testimonial from "@/components/reseller/white-labeling/testimonial";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Package,
  Palette,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
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
      title: "Consultation",
      description:
        "Share your vision, target market, and style preferences with our team.",
      image:
        "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800", // diskusi fashion dengan klien
    },
    {
      id: 2,
      title: "Design & Sampling",
      description:
        "We create tailored designs or adapt from our catalog. You’ll receive samples to review before production.",
      image:
        "https://images.pexels.com/photos/3738087/pexels-photo-3738087.jpeg?auto=compress&cs=tinysrgb&w=800", // desainer menggambar sketsa baju
    },
    {
      id: 3,
      title: "Production",
      description:
        "Once approved, our expert team manufactures your collection with your brand tag.",
      image:
        "https://images.pexels.com/photos/4483611/pexels-photo-4483611.jpeg?auto=compress&cs=tinysrgb&w=800", // proses jahit baju di pabrik
    },
    {
      id: 4,
      title: "Delivery",
      description:
        "Receive your branded products, ready to sell to your customers.",
      image:
        "https://images.pexels.com/photos/6169026/pexels-photo-6169026.jpeg?auto=compress&cs=tinysrgb&w=800", // box pakaian siap dikirim
    },
    {
      id: 5,
      title: "Grow Together",
      description:
        "Continue scaling your brand with new drops, seasonal collections, or custom collaborations.",
      image:
        "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800", // brand fashion berkembang, pakaian dipajang di toko
    },
  ];

  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const handleJoinNow = (service?: string) => {
    setShowForm(true);
    setSelectedService(service || "");
  };

  const servicesInput = [
    { value: "reseller", label: "Reseller Basic" },
    { value: "whitelabel", label: "White Labeling" },
  ];

  return (
    <>
      {/* Hero Section */}
      <SingleBanner page="reseller-whitelabeling">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Overlay hitam */}
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-primary text-primary-foreground">
              White Labeling
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold  mb-6">
              <span className="inline-flex items-center">
                <Sparkles className="w-8 h-8 lg:w-12 lg:h-12 text-white mr-4" />
                Build Your Own Pet Brand
                <Sparkles className="w-8 h-8 lg:w-12 lg:h-12 text-white ml-4" />
              </span>
              <br />
              <span className="text-primary">with Us</span>
            </h1>
            <p className="text-lg lg:text-xl">
              Turn your vision into reality with our exclusive white-label
              service. Customize our premium pet clothing & accessories with
              your own brand identity.
            </p>
            <Button
              onClick={() => handleJoinNow()}
              size="lg"
              className="inline-flex items-center gap-3 bg-white text-primary px-8 py-6 rounded-lg cursor-pointer text-base font-semibold hover:bg-white/95 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Book a Consultation
            </Button>
          </div>
        </div>
      </SingleBanner>

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
              onClick={() => handleJoinNow()}
              className="bg-gradient-to-r from-[#F69784] to-[#FBBD87] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center w-full max-w-xs sm:max-w-none sm:w-auto cursor-pointer hover:scale-105"
            >
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
                onClick={() => handleJoinNow("reseller")}
                className="w-full bg-gradient-to-r from-[#F69784] to-[#FBBD87] text-white py-6 rounded-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-lg mt-auto cursor-pointer"
              >
                Join Now!
              </Button>
            </div>

            {/* Custom Package */}
            <div className="bg-secondary border-2 border-primary/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                onClick={() => handleJoinNow("whitelabel")}
                className="w-full bg-gradient-to-r from-[#F69784] to-[#FBBD87] text-white py-6 rounded-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-lg mt-auto cursor-pointer"
              >
                Join Now!
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Testimonial />

      <FinalCTA onSetShowForm={setShowForm} />

      {showForm && (
        <CTAForm
          onSetShowForm={setShowForm}
          selectedService={selectedService}
          onSubmit={(whatsappUrl) => {
            window.open(whatsappUrl, "_blank");
          }}
          servicesInput={servicesInput}
        />
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
    </>
  );
}
