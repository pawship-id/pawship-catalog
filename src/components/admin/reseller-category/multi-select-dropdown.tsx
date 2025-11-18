"use client";
import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Search, X } from "lucide-react";
import { CategoryData } from "@/lib/types/category";
import { cn } from "@/lib/utils";

interface MultiSelectDropdownProps {
  categories: CategoryData[];
  selectedCategories: string[];
  onChange: (selected: string[]) => void;
}

/**
 * Multi-Select Dropdown Component with Search and Checkbox
 *
 * Features:
 * - Search functionality to filter categories
 * - Checkbox selection for each category
 * - Select All button
 * - Default all categories selected on mount
 * - Click outside to close
 * - Auto-scroll when more than 4 categories (max 180px height)
 * - Responsive design with dynamic height
 */
export default function MultiSelectDropdown({
  categories,
  selectedCategories,
  onChange,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize with all categories selected (only once on mount if empty)
  useEffect(() => {
    // Mark as initialized if there is data (for edit mode)
    if (selectedCategories.length > 0) {
      hasInitialized.current = true;
      return;
    }

    // Auto-initialize only if it has never been initialized and there is no data.
    if (
      !hasInitialized.current &&
      selectedCategories.length === 0 &&
      categories.length > 0
    ) {
      onChange(categories.map((cat) => cat._id));
      hasInitialized.current = true;
    }
  }, [categories, selectedCategories.length, onChange]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const selectAll = () => {
    onChange(categories.map((cat) => cat._id));
  };

  const deselectAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (selectedCategories.length === 0) {
      return "Select categories";
    }
    if (selectedCategories.length === categories.length) {
      return "All categories selected";
    }
    if (selectedCategories.length === 1) {
      const category = categories.find(
        (cat) => cat._id === selectedCategories[0]
      );
      return category?.name || "1 category selected";
    }
    return `${selectedCategories.length} categories selected`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm",
          "border border-gray-300 rounded-md bg-white",
          "focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/80",
          "hover:border-gray-400 transition-colors"
        )}
      >
        <span
          className={cn(
            "truncate",
            selectedCategories.length === 0 ? "text-gray-500" : "text-gray-900"
          )}
        >
          {getDisplayText()}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 ml-2 transition-transform flex-shrink-0",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-2 border-b border-gray-200 flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={selectAll}
              className="flex-1 text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors font-medium"
            >
              Select All
            </button>

            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={deselectAll}
                className="flex-1 text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors font-medium"
              >
                Deselect All
              </button>
            )}
          </div>

          {/* Categories List with dynamic max-height */}
          <div
            className={cn(
              "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
              filteredCategories.length > 4 ? "max-h-[180px]" : "max-h-fit"
            )}
            style={{
              // Each item is approximately 40px (py-2 + content height)
              // Show max 4 items before scrolling
              maxHeight: filteredCategories.length > 4 ? "180px" : "auto",
              // Custom scrollbar styling for better UX
              scrollbarWidth: "thin",
              scrollbarColor: "#D1D5DB #F3F4F6",
            }}
          >
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No categories found
              </div>
            ) : (
              filteredCategories.map((category) => (
                <label
                  key={category._id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={() => toggleCategory(category._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {category.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
