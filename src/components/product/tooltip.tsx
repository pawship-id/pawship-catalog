import React, { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export default function Tooltip() {
  const [open, setOpen] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div ref={tooltipRef} className="relative inline-block">
      <Info
        className="w-4 h-4 text-gray-400 cursor-help"
        onClick={() => setOpen((prev) => !prev)}
      />
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-200 bg-gray-800 text-white text-sm rounded-lg p-3 w-64 z-10 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        Quantities can be mixed within models, colors, and sizes. For
        basics/essentials products, quantity can only be mixed within colors and
        sizes.
      </div>
    </div>
  );
}
