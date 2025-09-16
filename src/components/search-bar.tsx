import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SearchBar({ setIsSearchOpen }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div
        className="absolute top-0 w-[100vw] h-[100vh] flex flex-col items-center"
        onClick={() => setIsSearchOpen(false)}
      ></div>

      <div
        className="absolute flex flex-col w-full items-center"
        onClick={() => setIsSearchOpen(false)}
      >
        <div
          className="w-[90vw] max-w-3xl border-t bg-background shadow-sm rounded-b-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="container mx-auto px-4 pt-6 pb-12">
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-white rounded-full border border-gray-200 shadow-sm">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Enter Product Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-5 py-3 text-base w-full border-0 bg-white rounded-full focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-gray-400"
                  autoFocus
                />
              </div>

              {searchQuery === "" && (
                <div className="mt-8 text-center">
                  <div className="mb-3">
                    <Search className="h-12 w-12 text-gray-300 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    You have not searched anything yet
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Start typing a product name in the input
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
