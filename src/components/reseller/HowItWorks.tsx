import React, { useState } from "react";
import {
  UserPlus,
  CheckCircle,
  ShoppingBag,
  Rocket,
  ShoppingCart,
  X,
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: UserPlus,
      title: "Apply for Reseller Account",
      description:
        "Sign up and get your reseller credentials. We'll verify and onboard you.",
      details:
        "Fill in our registration form with your store details including store name, owner name, country, email, and phone number. Once submitted, you'll receive a WhatsApp message: 'Hi I'm interested to be your reseller!' and we'll guide you through the verification process.",
      cta: "Apply Now",
    },
    {
      id: 2,
      icon: CheckCircle,
      title: "Get Approved",
      description:
        "Receive details of your discount tier, MOQ, and reseller benefits",
      details:
        "After verification, you'll receive your personalized reseller agreement including your discount tier (up to 30% off), minimum order quantities, payment terms, and exclusive reseller benefits. This typically takes 1-2 business days.",
    },
    {
      id: 3,
      icon: ShoppingBag,
      title: "Explore Catalog with Reseller Prices",
      description:
        "Log in anytime to view catalog, updated price lists, and reseller-only discounts directly on our website.",
      details:
        "Access our exclusive reseller portal where you can browse our complete catalog with your personalized pricing, view product specifications, check stock availability, and download high-quality product images for your marketing.",
    },
    {
      id: 4,
      icon: ShoppingCart,
      title: "Place your Order",
      description:
        "Order products with reseller pricing, stock up, and grow your business with us.",
      details:
        "Order products with reseller pricing, receive your shipment with all necessary documentation and marketing materials, then start building your pet accessories business with our ongoing support.",
    },
    {
      id: 5,
      icon: Rocket,
      title: "Start Selling",
      description: "Place your order, receive your goods and start selling!",
      details:
        "Order products with reseller pricing, receive your shipment with all necessary documentation and marketing materials, then start building your pet accessories business with our ongoing support.",
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

    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
    setShowForm(false);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            How it Works
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#F79985] to-[#FCBE87] mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {steps.map((step) => (
              <div
                key={step.id}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F79985] to-[#FCBE87] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {step.id}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <step.icon className="w-6 h-6 text-[#F79985]" />
                      <h3 className="text-2xl font-bold text-gray-800">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* <p className="text-gray-500 leading-relaxed mb-6">
                      {step.details}
                    </p> */}

                    {step.cta && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-to-r from-[#F79985] to-[#FCBE87] text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        {step.cta}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <input
                  type="text"
                  name="storeName"
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

              <button className="w-full bg-salmon-600 hover:bg-salmon-700 text-white font-semibold py-3 rounded-lg transition-colors duration-300">
                Send to WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;
