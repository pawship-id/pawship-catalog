"use client";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  Ruler,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { ProductData } from "@/lib/types/product";

interface ProductTabsProps {
  product: ProductData;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [expandedTab, setExpandedTab] = useState("description");
  const [activeTabSize, setActiveTabSize] = useState("size-chart");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const sizeImages = product.sizeProduct || [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? sizeImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === sizeImages.length - 1 ? 0 : prev + 1
    );
  };

  const sizeChart = [
    {
      size: "XS",
      neck: "20-25",
      chest: "30-35",
      length: 20,
    },
    {
      size: "S",
      neck: "25-30",
      chest: "35-40",
      length: 25,
    },
    {
      size: "M",
      neck: "30-35",
      chest: "40-45",
      length: 30,
    },
    {
      size: "L",
      neck: "35-40",
      chest: "45-50",
      length: 35,
    },
  ];

  return (
    <div className="my-8 space-y-4">
      <div className="border-b-2 border-gray-200">
        <div className="group">
          <button
            className="w-full text-left text-lg pb-2 group-hover:text-primary transition-colors flex justify-between items-center"
            onClick={() =>
              setExpandedTab(expandedTab === "description" ? "" : "description")
            }
          >
            Description
            <span className="text-gray-400">
              {expandedTab === "description" ? (
                <ChevronUp className="group-hover:text-primary" />
              ) : (
                <ChevronDown className="group-hover:text-primary" />
              )}
            </span>
          </button>
        </div>
        {expandedTab === "description" && (
          <div className="mt-2 pb-4 text-gray-600">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.productDescription,
              }}
            />
          </div>
        )}
      </div>

      <div className="border-b-2 border-gray-200">
        <div className="group">
          <button
            className="w-full text-left pb-2 group-hover:text-primary transition-colors flex justify-between items-center"
            onClick={() => setExpandedTab(expandedTab === "size" ? "" : "size")}
          >
            Size Guide
            <span className="text-gray-400">
              {expandedTab === "size" ? (
                <ChevronUp className="group-hover:text-primary" />
              ) : (
                <ChevronDown className="group-hover:text-primary" />
              )}
            </span>
          </button>
        </div>

        {expandedTab === "size" && (
          <div className="mt-2 pb-4 text-gray-600">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { id: "size-chart", label: "Size Chart" },
                  { id: "how-to-measure", label: "How To Measure" },
                ].map((tab) => {
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabSize(tab.id)}
                      className={`flex-1 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTabSize === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <p className="mb-2">{tab.label}</p>
                    </button>
                  );
                })}
              </nav>
            </div>

            {activeTabSize === "size-chart" && (
              <div className="space-y-6 mt-6">
                {/* Size Chart Image Slider */}
                <div className="flex justify-center">
                  <div className="relative w-full max-w-sm aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={sizeImages[currentImageIndex].imageUrl}
                      alt={`Size chart ${currentImageIndex + 1}`}
                      fill
                      className="object-contain"
                      priority
                    />

                    {/* Slider Controls - Only show if more than 1 image */}
                    {sizeImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-800" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-800" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {sizeImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === currentImageIndex
                                  ? "bg-primary w-6"
                                  : "bg-white/60 hover:bg-white/80"
                              }`}
                              aria-label={`Go to image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Size Recommender
                  </h3>

                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Neck (cm)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                        placeholder="Enter neck measurement"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chest (cm)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                        placeholder="Enter chest measurement"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fit Preference
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent">
                        <option value="">Select fit preference</option>
                        <option value="loose">Loose</option>
                        <option value="normal">Normal</option>
                        <option value="tight">Tight</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full hover:bg-primary bg-primary/90"
                    >
                      Get Size Recommendation
                    </Button>
                  </form>
                </div>

                <div className="bg-secondary border border-primary/50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    <Ruler className="mr-2 h-4 w-4 inline" />
                    Not finding the right fit?
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Every pet is unique — and we’ve got them covered! If your
                    pawfriend needs a size outside our chart or special
                    adjustments, we can create a{" "}
                    <b>custom size just for them</b>.
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    💡 Custom sizes come with a small extra charge and vary by
                    request.
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    👉 Talk to Our Agent to discuss your pet’s exact needs and
                    get a tailored price
                  </p>
                  <button className="flex items-center space-x-2 text-primary/90 hover:text-primary font-medium">
                    <MessageCircle className="h-4 w-4" />
                    <span>Talk to Our Team</span>
                  </button>
                </div>
              </div>
            )}
            {activeTabSize === "how-to-measure" && (
              <div className="py-4">
                <p className="text-wrap">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit
                  quibusdam, optio necessitatibus dicta repellendus obcaecati ex
                  velit sed harum excepturi sequi saepe sunt voluptate, laborum
                  maxime non pariatur veniam porro.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-b-2 border-gray-200">
        <div className="group">
          <button
            className="w-full text-left pb-2 group-hover:text-primary transition-colors flex justify-between items-center"
            onClick={() =>
              setExpandedTab(expandedTab === "shipping" ? "" : "shipping")
            }
          >
            Shipping
            <span className="text-gray-400">
              {expandedTab === "shipping" ? (
                <ChevronUp className="group-hover:text-primary" />
              ) : (
                <ChevronDown className="group-hover:text-primary" />
              )}
            </span>
          </button>
        </div>

        {expandedTab === "shipping" && (
          <div className="mt-2 pb-4 text-gray-600">
            <h3 className="font-semibold text-gray-900 my-3">
              Delivery Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">SEA Region:</span>
                <span className="text-gray-600">
                  Estimated delivery 3-5 business days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  Other Regions:
                </span>
                <span className="text-gray-600">
                  Estimated delivery 7-14 business days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  Shipping Cost:
                </span>
                <span className="text-gray-600">Calculated at checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-b-2 border-gray-200">
        <div className="group">
          <button
            className="w-full text-left pb-2 group-hover:text-primary transition-colors flex justify-between items-center"
            onClick={() =>
              setExpandedTab(expandedTab === "reseller" ? "" : "reseller")
            }
          >
            Reseller
            <span className="text-gray-400">
              {expandedTab === "reseller" ? (
                <ChevronUp className="group-hover:text-primary" />
              ) : (
                <ChevronDown className="group-hover:text-primary" />
              )}
            </span>
          </button>
        </div>
        {expandedTab === "reseller" && (
          <div className="mt-2 pb-4 text-gray-600">
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  Wholesale & White Label Service
                </h3>
                <p className="text-gray-700">
                  As an authorized reseller, you have access to wholesale
                  pricing, custom branding options, and dedicated support. Our
                  white-label services allow you to customize products with your
                  own branding.
                </p>
                <div>
                  <p className="flex items-center gap-1 mb-1">
                    Want your own label?
                  </p>
                  <a
                    href="/reseller/white-labeling"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Learn about White Labeling</span>
                  </a>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  📂 Marketing Kit for Resellers
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Download ready-to-use product photos, lifestyle shots, and
                  captions to promote this item to your customers.
                </p>
                <a
                  href="https://drive.google.com/file/d/1K8rGfSZRVUb-MG5kf8VEzIlb8ljzbKZK/view?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Download Marketing Content</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
