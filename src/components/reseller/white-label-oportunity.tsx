import { ArrowRight, Crown, Heart } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function WhiteLabelOportunity() {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="bg-primary/90 text-center py-15 rounded-3xl">
          <div className="mb-8">
            <Crown className="w-16 h-16 mx-auto mb-4 text-[#FBBD87]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Want Your Own Brand?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto leading-relaxed">
            Our White-Label Service helps you customize products with your
            branding. Perfect for stores who want to stand out.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-24 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-sm text-white/80">Your Logo</span>
              </div>
              <ArrowRight className="w-6 h-6 mx-4 text-[#FBBD87]" />
              <div className="w-24 h-16 bg-[#FBBD87] rounded-lg flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-sm text-white/80">
              Custom branding on premium pet products
            </p>
          </div>
          <Button
            asChild
            className="bg-white text-primary hover:bg-white hover:text-primary cursor-pointer px-6 py-8 rounded-lg text-lg font-semibold transform hover:scale-105 transition-all duration-300"
          >
            <Link href="reseller/white-labeling">Explore White-Labeling</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
