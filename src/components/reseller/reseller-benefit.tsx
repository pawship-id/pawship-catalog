import React from "react";
import { DollarSign, Package, Palette, Star } from "lucide-react";

export default function ResellerBenefit() {
  const resellerBenefitContent = [
    {
      title: "Exclusive Pricing & Discounts",
      icon: DollarSign,
    },
    {
      title: "Low MOQ & Flexible Bulk Options",
      icon: Package,
    },
    {
      title: "Access to White-Label Service (optional add-on)",
      icon: Palette,
    },
    {
      title: "Early access to new designs",
      icon: Star,
    },
  ];
  return (
    <>
      <section className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div
            className="text-primary-foreground rounded-3xl p-15"
            style={{
              background: `linear-gradient(to right, #F69784, #FBBD87)`,
            }}
          >
            <div className="space-y-2 text-center mb-10">
              <h2 className="text-3xl font-bold">
                Reseller Benefits (Why Join?)
              </h2>
              <p className="text-lg max-w-2xl mx-auto">
                Get special prices, high profit margins, and full support to
                grow your business with ease 🚀
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resellerBenefitContent.map((item, idx) => {
                let Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(to right, #F69784, #FBBD87)`,
                      }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
