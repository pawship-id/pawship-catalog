import React, { useState } from "react";
import { Download, ExternalLink, Ruler, Truck, Users } from "lucide-react";
import { Product, User } from "@/app/product/[slug]/page";

interface ProductTabsProps {
  product: Product;
  user: User;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ product, user }) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description", icon: null },
    { id: "sizing", label: "Sizing", icon: Ruler },
    { id: "shipping", label: "Shipping", icon: Truck },
    ...(user.type === "b2b"
      ? [{ id: "resellers", label: "Resellers", icon: Users }]
      : []),
  ];

  const renderDescription = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
        <p className="text-gray-700">{product.description}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Materials</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {product.materials.map((material, index) => (
            <li key={index}>{material}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {product.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Care Instructions</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {product.careInstructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderSizing = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Sizing Guide</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">{product.sizingGuide}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Size Recommender</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Neck (cm)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., 40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chest (cm)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., 95"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fit Preference
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option>Regular</option>
              <option>Loose</option>
              <option>Tight</option>
            </select>
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          Get Size Recommendation
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Not finding the right fit? Every pet is unique — we can create a
          custom size with a small extra charge.
          <a
            href="#"
            className="text-blue-600 font-semibold hover:underline ml-1"
          >
            Talk to Our Agent
          </a>
        </p>
      </div>
    </div>
  );

  const renderShipping = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Delivery Time</h3>
        <div className="space-y-3">
          {Object.entries(product.shippingInfo).map(([region, info]) => (
            <div
              key={region}
              className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">
                  {region === "SEA" ? "Southeast Asia" : "Other Regions"}
                </div>
                <div className="text-sm text-gray-600">
                  {info.regions.join(", ")}
                </div>
              </div>
              <div className="font-semibold text-orange-600">{info.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-700">
          <strong>Delivery Cost:</strong> Calculated at checkout based on your
          location and order weight.
        </p>
      </div>
    </div>
  );

  const renderResellers = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">
          Wholesale & White-Label
        </h3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800">
            Access exclusive wholesale pricing and white-label opportunities.
            Contact your account manager for custom branding options and bulk
            order arrangements.
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">
          Marketing Resources
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">
                  Product Images & Assets
                </div>
                <div className="text-sm text-gray-600">
                  High-res images, lifestyle shots, size charts
                </div>
              </div>
            </div>
            <a
              href={product.marketingKitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium"
            >
              Download <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">
                  Bulk Order Template
                </div>
                <div className="text-sm text-gray-600">
                  Excel template for large quantity orders
                </div>
              </div>
            </div>
            <button className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium">
              Download <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return renderDescription();
      case "sizing":
        return renderSizing();
      case "shipping":
        return renderShipping();
      case "resellers":
        return renderResellers();
      default:
        return renderDescription();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {tab.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">{renderTabContent()}</div>
    </div>
  );
};

export default ProductTabs;
