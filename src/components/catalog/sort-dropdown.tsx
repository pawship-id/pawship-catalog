import {
  Award,
  ChevronDown,
  DollarSign,
  SlidersHorizontal,
  Tag,
  Zap,
} from "lucide-react";
import React, { useState } from "react";

interface SortDropdownProps {
  sortBy: string;
  onSortChange: React.Dispatch<React.SetStateAction<string>>;
}

export default function SortDropdown({
  sortBy,
  onSortChange,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: "sorting by", label: "Sorting By", icon: Award },
    { value: "price-low", label: "Price: Low to High", icon: DollarSign },
    { value: "price-high", label: "Price: High to Low", icon: DollarSign },
    { value: "newest", label: "Newest First", icon: Zap },
    { value: "name", label: "Name A-Z", icon: Tag },
  ];

  const currentOption = sortOptions.find((option) => option.value === sortBy);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 min-w-[200px]"
      >
        <SlidersHorizontal className="text-gray-500" size={18} />
        <span className="font-medium text-gray-700">
          {currentOption?.label}
        </span>
        <ChevronDown
          className={`text-gray-500 ml-auto transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          size={18}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {sortOptions.map((option, idx) => {
            const Icon = option.icon;
            if (idx === 0) return null;

            return (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  sortBy === option.value
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700"
                }`}
              >
                <Icon
                  size={16}
                  className={
                    sortBy === option.value
                      ? "text-orange-500"
                      : "text-gray-400"
                  }
                />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
