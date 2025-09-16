"use client";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  Ruler,
} from "lucide-react";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";

export default function ProductTabs() {
  const [expandedTab, setExpandedTab] = useState("description");
  const [activeTabSize, setActiveTabSize] = useState("size-chart");
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
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Overview</h3>
                <p className="text-gray-700">
                  Crafted from premium soft cotton, the Magician BIP Set offers
                  all-day comfort with a lightweight and breathable feel. Gentle
                  on the skin, it’s safe for babies and kids. The playful
                  magician-themed design makes it not only functional but also
                  stylish for everyday wear.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Key Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  {[
                    "Premium cotton material, soft & breathable",
                    "Ergonomic design for maximum comfort",
                    "Unique magician-themed pattern",
                    "Perfect for daily use or special occasions",
                  ].map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  Care Instructions
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {[
                    "Hand wash or machine wash on gentle cycle",
                    "Use mild detergent, avoid bleach",
                    "Dry in the shade to maintain color vibrancy",
                    "Iron on low heat if needed",
                  ].map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
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
                <Table className="border border-gray-300 overflow-x-auto">
                  <TableHeader>
                    <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="font-medium border border-gray-300">
                        Size
                      </TableHead>
                      <TableHead className="font-medium border border-gray-300">
                        Neck (cm)
                      </TableHead>
                      <TableHead className="font-medium border border-gray-300">
                        Chest (cm)
                      </TableHead>
                      <TableHead className="font-medium border border-gray-300">
                        Length (cm)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sizeChart.map((item, idx) => {
                      return (
                        <TableRow
                          key={idx}
                          className="hover:bg-gray-50 transition-colors border border-gray-300"
                        >
                          <TableCell className="font-medium border border-gray-300">
                            {item.size}
                          </TableCell>
                          <TableCell className="border border-gray-300">
                            {item.neck}
                          </TableCell>
                          <TableCell className="border border-gray-300">
                            {item.chest}
                          </TableCell>
                          <TableCell className="border border-gray-300">
                            {item.length}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

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
                    <span>Talk to Our Agent</span>
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
                  href=""
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
