import { MessageCircle, Sparkles, X } from "lucide-react";
import React, { useState } from "react";

interface ServiceInput {
  value: string;
  label: string;
}

interface CTAFormProps {
  onSetShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (i: string) => void;
  servicesInput: ServiceInput[];
  selectedService: string;
}

export default function CTAForm({
  onSetShowForm,
  onSubmit,
  servicesInput,
  selectedService,
}: CTAFormProps) {
  const [formData, setFormData] = useState({
    brandName: "",
    ownerName: "",
    phoneNumber: "",
    service: selectedService || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let message = `Hi, I'm ${formData.ownerName}, interested in your White Labeling Service. My phone is ${formData.phoneNumber}.`;

    if (formData.brandName) {
      message += ` Brand: ${formData.brandName}.`;
    }

    const whatsappUrl = `https://wa.me/628158843760?text=${encodeURIComponent(
      message
    )}`;

    onSetShowForm(false);
    setFormData({
      brandName: "",
      ownerName: "",
      phoneNumber: "",
      service: "",
    });
    onSubmit(whatsappUrl);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
        <button
          onClick={() => onSetShowForm(false)}
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
            No commitments yet — just a first step to explore opportunities with
            us.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
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
              {servicesInput.map((item, idx) => {
                return (
                  <option key={idx} value={item.value}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </div>

          <button className="w-full bg-gradient-to-r from-[#F79985] to-[#FCBE87] hover:scale-105 text-white font-semibold py-3 rounded-lg text-base transition-all duration-300 shadow-lg">
            Let's Talk
            <MessageCircle className="inline h-5 w-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
