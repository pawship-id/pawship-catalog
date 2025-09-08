import React from "react";
import { whyTrustUsContents } from "@/lib/data/reseller";

export default function WhyTrustUs() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Why Trust Us?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#F79985] to-[#FCBE87] mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
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
  );
}
