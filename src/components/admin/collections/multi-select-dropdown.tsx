"use client";
import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  _id: string;
  name: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selectedIds: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  loading?: boolean;
}

/**
 * Multi-Select Dropdown Component with Search and Checkbox
 *
 * Features:
 * - Search functionality to filter options
 * - Checkbox selection for each option
 * - Select All / Clear All buttons
 * - No default selection (empty by default)
 * - Click outside to close
 * - Auto-scroll when more than 4 options (max 180px height)
 * - Responsive design with dynamic height
 */
export default function MultiSelectDropdown({
  options,
  selectedIds,
  onChange,
  placeholder = "Select items",
  searchPlaceholder = "Search...",
  label,
  loading = false,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (optionId: string) => {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((id) => id !== optionId));
    } else {
      onChange([...selectedIds, optionId]);
    }
  };

  const selectAll = () => {
    onChange(options.map((opt) => opt._id));
  };

  const clearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    // Filter selectedIds to only include IDs that exist in current options
    const validSelectedIds = selectedIds.filter((id) =>
      options.some((opt) => opt._id === id)
    );

    if (validSelectedIds.length === 0) {
      return placeholder;
    }
    if (validSelectedIds.length === options.length) {
      return `All ${label || "items"} selected`;
    }
    if (validSelectedIds.length === 1) {
      const option = options.find((opt) => opt._id === validSelectedIds[0]);
      return option?.name || `1 ${label || "item"} selected`;
    }
    return `${validSelectedIds.length} ${label || "items"} selected`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm",
          "border border-gray-300 rounded-md bg-white",
          "focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary/80",
          "hover:border-gray-400 transition-colors",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "truncate",
            selectedIds.length === 0 ? "text-gray-500" : "text-gray-900"
          )}
        >
          {loading ? "Loading..." : getDisplayText()}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 ml-2 transition-transform flex-shrink-0",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
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
              disabled={selectedIds.length === options.length}
              className={cn(
                "flex-1 text-xs px-2 py-1 rounded transition-colors",
                selectedIds.length === options.length
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              )}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={selectedIds.length === 0}
              className={cn(
                "flex-1 text-xs px-2 py-1 rounded transition-colors",
                selectedIds.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              )}
            >
              Clear All
            </button>
          </div>

          {/* Options List with dynamic max-height */}
          <div
            className={cn(
              "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
              filteredOptions.length > 4 ? "max-h-[180px]" : "max-h-fit"
            )}
            style={{
              // Each item is approximately 40px (py-2 + content height)
              // Show max 4 items before scrolling
              maxHeight: filteredOptions.length > 4 ? "180px" : "auto",
              // Custom scrollbar styling for better UX
              scrollbarWidth: "thin",
              scrollbarColor: "#D1D5DB #F3F4F6",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {options.length === 0
                  ? `No ${label || "items"} available`
                  : "No results found"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option._id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedIds.includes(option._id)}
                    onCheckedChange={() => toggleOption(option._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {option.name}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Selected Count Footer */}
          {selectedIds.length > 0 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <p className="text-xs text-gray-600 text-center">
                {selectedIds.length} of {options.length} selected
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
