import { getAll, getById } from "@/lib/apiService";
import { CategoryData } from "@/lib/types/category";
import {
  ChevronDown,
  DollarSign,
  Filter,
  LoaderCircle,
  Shirt,
  ShoppingBag,
  Target,
} from "lucide-react";
import React, { useEffect, useState } from "react";

type TSelectedFilter = {
  categories: string[];
  sizes: string[];
  stocks: string;
  priceRange: [number, number];
  sortBy?: string;
};

type TSection = "categories" | "sizes" | "priceRange" | "stocks";

interface FilterSidebarProps {
  selectedFilters: TSelectedFilter;
  onFiltersChange: React.Dispatch<React.SetStateAction<TSelectedFilter>>;
  catagoryTab?: boolean;
  sizes: string[];
}

export default function FilterSidebar({
  selectedFilters,
  onFiltersChange,
  catagoryTab = true,
  sizes,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    sizes: true,
    priceRange: true,
    stocks: true,
  });

  const toggleSection = (section: TSection) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (sizes.length === 0) {
    sizes = ["S", "M", "L", "XL"];
  }

  const stocks = ["Ready", "Pre-Order"];

  const handleFilterChange = (
    filterType: TSection,
    value: string | number[]
  ) => {
    const newFilters = { ...selectedFilters };

    switch (filterType) {
      case "categories":
        if (typeof value === "string") {
          newFilters[filterType] = newFilters[filterType].includes(value)
            ? newFilters[filterType].filter((v) => v !== value)
            : [...newFilters[filterType], value];
        }
        break;
      case "sizes":
        if (typeof value === "string") {
          newFilters[filterType] = newFilters[filterType].includes(
            value.toUpperCase()
          )
            ? newFilters[filterType].filter((v) => v !== value.toUpperCase())
            : [...newFilters[filterType], value.toUpperCase()];
        }
        break;

      case "stocks":
        if (typeof value === "string") {
          newFilters.stocks = newFilters.stocks === value ? "" : value;
        }
        break;

      case "priceRange":
        if (Array.isArray(value)) {
          const [min, max] = value;
          newFilters.priceRange = [isNaN(min) ? 0 : min, isNaN(max) ? 0 : max];
        }
        break;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      sizes: [],
      stocks: "",
      priceRange: [0, 0],
    });
  };

  const handlePriceChange = (index: number, value: number) => {
    const newRange = [...selectedFilters.priceRange];

    newRange[index] = value ? Number(value) : 0;

    handleFilterChange("priceRange", newRange);
  };

  const [categories, setCategories] = useState<CategoryData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<CategoryData>("/api/admin/categories");

      if (response.data) {
        setCategories(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (catagoryTab) {
      fetchCategory();
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Filter className="text-orange-600" size={24} />
            <span>Filters</span>
          </h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Categories */}
        {catagoryTab && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("categories")}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <ShoppingBag className="text-purple-500" size={20} />
                <span>Categories</span>
              </h4>
              <ChevronDown
                className={`text-gray-500 transition-transform duration-200 ${
                  expandedSections.categories ? "rotate-180" : ""
                }`}
                size={18}
              />
            </button>

            {expandedSections.categories && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <LoaderCircle
                        className="animate-spin text-gray-700"
                        size={24}
                      />
                    </div>
                  </div>
                ) : error ? (
                  <p className="text-sm text-gray-700">Error: {error}</p>
                ) : categories?.length ? (
                  categories?.map((category, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 cursor-pointer group"
                      htmlFor={`${category.name}-${index}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.categories.includes(
                          category.name
                        )}
                        onChange={() =>
                          handleFilterChange("categories", category.name)
                        }
                        id={`${category.name}-${index}`}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                        {category.name}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-700">No category found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("priceRange")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <DollarSign className="text-orange-500" size={20} />
              <span>Price</span>
            </h4>
            <ChevronDown
              className={`text-gray-500 transition-transform duration-200 ${
                expandedSections.priceRange ? "rotate-180" : ""
              }`}
              size={18}
            />
          </button>

          {expandedSections.priceRange && (
            <div className="w-full max-w-sm">
              {/* Input Harga Minimal */}
              <div className="flex items-center border rounded-lg px-3 py-2 mb-3">
                <span className="text-gray-700 mr-2">Rp</span>
                <input
                  type="number"
                  placeholder="Minimum Price"
                  className="w-full outline-none placeholder-gray-700"
                  onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                  value={selectedFilters.priceRange[0] || ""}
                />
              </div>

              {/* Input Harga Maksimal */}
              <div className="flex items-center border rounded-lg px-3 py-2">
                <span className="text-gray-700 mr-2">Rp</span>
                <input
                  type="number"
                  placeholder="Maximum Price"
                  className="w-full outline-none placeholder-gray-700"
                  onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                  value={selectedFilters.priceRange[1] || ""}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sizes */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("sizes")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Shirt className="text-primary" size={20} />
              <span>Sizes</span>
            </h4>
            <ChevronDown
              className={`text-gray-500 transition-transform duration-200 ${
                expandedSections.sizes ? "rotate-180" : ""
              }`}
              size={18}
            />
          </button>

          {expandedSections.sizes && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              {sizes.map((size) => (
                <label
                  key={size}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.sizes.includes(size)}
                    onChange={() => handleFilterChange("sizes", size)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                    {size}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Stock */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("stocks")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Target className="text-blue-400" size={20} />
              <span>Stock</span>
            </h4>
            <ChevronDown
              className={`text-gray-500 transition-transform duration-200 ${
                expandedSections.stocks ? "rotate-180" : ""
              }`}
              size={18}
            />
          </button>

          {expandedSections.stocks && (
            <div className="space-y-2 pl-1">
              {stocks.map((el, index) => {
                return (
                  <label
                    key={index}
                    className="flex items-center space-x-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="stock-option"
                      value={el}
                      checked={selectedFilters.stocks === el}
                      onChange={(e) =>
                        onFiltersChange({
                          ...selectedFilters,
                          stocks: e.target.value,
                        })
                      }
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                      {el}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
