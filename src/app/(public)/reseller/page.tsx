import React from "react";

import FinalCTA from "@/components/reseller/final-cta";
import HowItWorks from "@/components/reseller/how-it-works";
import ResellerBenefit from "@/components/reseller/reseller-benefit";
import ResellingTypes from "@/components/reseller/reselling-types";
import WhiteLabelOportunity from "@/components/reseller/white-label-oportunity";
import WhyTrustUs from "@/components/reseller/why-trust-us";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function ResellerPage() {
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
              className="inline-flex items-center gap-3 bg-white text-primary px-8 py-6 rounded-lg cursor-pointer text-base font-semibold hover:bg-white/95 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <UserPlus size={26} />
              Join Now
            </Button>
          </div>
        </div>
      </section>
      {/* Why Trust Us? */}
      <WhyTrustUs />

      {/* Reselling Types */}
      <ResellingTypes />

      {/* How it Works */}
      <HowItWorks />

      {/* Reseller Benefit */}
      <ResellerBenefit />

      {/* White-Label Callout */}
      <WhiteLabelOportunity />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
}
