"use client";
import SingleBanner from "@/components/common/single-banner";
import { Badge } from "@/components/ui/badge";
import { Instagram, Mail, MessageCircle, Send } from "lucide-react";
import React, { useState } from "react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <SingleBanner page="contact-us">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Overlay hitam */}
        <div className="relative z-10 flex items-center justify-center h-full text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-primary text-primary-foreground">
              Get in Touch
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold">
              We're Here to <span className="text-primary">Help</span>
            </h1>
          </div>
        </div>
      </SingleBanner>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                autoComplete="off"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/90 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/90 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/90 focus:border-transparent resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary/90 hover:bg-primary cursor-pointer text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-secondary shadow-md rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Quick Contact
                </h2>

                <div className="space-y-4 grid md:grid-cols-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center">
                      <Instagram className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">Instagram</p>
                      <p className="text-gray-600 break-words">@pawship.id</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">Email Us</p>
                      <p className="text-gray-600 break-words">
                        pawship.id@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">
                        WhatsApp for Resellers
                      </p>
                      <p className="text-gray-600 break-words">
                        +62 815 8843 760
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">
                        WhatsApp for Retail
                      </p>
                      <p className="text-gray-600 break-words">
                        +62 812 3135 1150
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
