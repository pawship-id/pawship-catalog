"use client";
import { Play, Heart, Eye } from "lucide-react";
import React, { useState } from "react";

interface Reel {
  _id: string;
  thumbnailUrl: string;
  link: string;
  likes: number;
  views: number;
}

interface ReelCardProps {
  reel: Reel;
}

export default function ReelCard({ reel }: ReelCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  const handleClick = () => {
    window.open(reel.link, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="relative group cursor-pointer overflow-hidden rounded-xl bg-black aspect-[9/16]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <img
        src={reel.thumbnailUrl}
        alt="Reel thumbnail"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isHovered ? "bg-black/30" : ""
        }`}
      />

      {/* Play button */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-white bg-opacity-90 rounded-full p-4 transform transition-transform duration-300 hover:scale-110">
          <Play className="w-6 h-6 text-black fill-black" />
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="flex justify-between items-center text-white text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Play className="w-4 h-4" />
              <span>{formatNumber(reel.views || 0)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{formatNumber(reel.likes || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
