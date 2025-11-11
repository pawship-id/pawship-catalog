import SingleBanner from "@/components/common/single-banner";
import { Badge } from "@/components/ui/badge";
import React from "react";

export default function StorePage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <SingleBanner page="stores">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Overlay hitam */}
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-primary text-primary-foreground">
              Our Store
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Visit <span className="text-primary">Pawship</span> In-Store
            </h1>
            <p className="text-lg lg:text-xl">
              Experience our products in person, try them on your pawfriends,
              and enjoy exclusive in-store perks.
            </p>
          </div>
        </div>
      </SingleBanner>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-18 items-start">
            {/* Store Images */}
            <div className="space-y-4 lg:space-y-6">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                <img
                  src="/images/banner/about-us-banner-pawship-offline-store.jpeg"
                  alt="Pawship Store Surabaya exterior"
                  className="w-full h-64 lg:h-100 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-xl shadow-lg group">
                  <img
                    src="https://lh3.googleusercontent.com/gps-cs-s/AC9h4nq23fO4FSzR5hWwqxql3DEBz-BQOeabMAGCvz9o9C26i8QhFJ-pjx0rKzP2J7ugidDT-FLFYnUjZu44XGRDw78AtC2WkmIqDMg_xLyu0Biea5JqoZOgulnMtjNnj-zkarvsDcft=s1360-w1360-h1020-rw"
                    alt="Pawship Store interior"
                    className="w-full h-32 lg:h-50 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="relative overflow-hidden rounded-xl shadow-lg group">
                  <img
                    src="https://lh3.googleusercontent.com/gps-cs-s/AC9h4npftY_TFGSO67FobuHxrelXZrdbjVnRgrgVmMFXN922W-gtc-U3cHMhIh6XWGEyBqRaRJYNuf5D9Q3d_E6SeLzTLEljqbz_nMj0klodRSsbgc8mpJCFlp58DoHIREqZRCQB8Vdn=s1360-w1360-h1020-rw"
                    alt="Pawship Store products display"
                    className="w-full h-32 lg:h-50 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div className="space-y-8">
              <div className="text-left">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Our Flagship Store 🐾
                </h2>
              </div>

              {/* Store Information */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Store Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">🏪</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Store Name
                      </h4>
                      <p className="text-muted-foreground">
                        Pawship Store Surabaya
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">📍</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Address
                      </h4>
                      <a
                        href="https://share.google/Wa56QxA2hVQbZNQft"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View on Google Maps
                        <span className="text-xs">↗</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">🕒</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Opening Hours
                      </h4>
                      <p className="text-muted-foreground">
                        Monday - Sunday 09.00-21.00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">📞</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Contact
                      </h4>
                      <a
                        href="tel:+6281231351150"
                        className="text-primary hover:underline"
                      >
                        +62 812 3135 1150
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Find Us Here
                </h3>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.599289224744!2d112.77348957656885!3d-7.286349471616588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fb18f9b4ab93%3A0x4781b7b4299a295d!2sPawship%20Pet%20Shop%20Surabaya%20Timur!5e0!3m2!1sid!2sus!4v1759463150615!5m2!1sid!2sus"
                    width="100%"
                    height="400"
                    className="md:h-[300px] lg:h-[350px]"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
