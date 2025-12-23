import React from "react";
import { Instagram, Youtube } from "lucide-react";

export default function ConnectWithUs() {
  return (
    <section className="pt-16 pb-10">
      <div className="container mx-auto px-4">
        <div className="space-y-4 text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground">
            Connect With Us 🐾
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow us, share your stories, and join our journey in making tails
            wag every day!
          </p>
        </div>

        {/* Social Media Links */}
        <div className="flex gap-4 w-full justify-center my-8 md:my-10">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/pawship.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 md:space-x-4 md:p-6 md:bg-white md:rounded-2xl md:shadow-lg hover:shadow-xl transition-all duration-300 group md:border md:border-gray-100"
          >
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-3 sm:p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Instagram className="w-8 h-8 md:w-6 md:h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0 hidden md:block">
              <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors text-sm md:text-base">
                Instagram
              </h4>
              <p className="text-gray-600 text-xs md:text-sm">@pawship.id</p>
            </div>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@pawship.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 md:space-x-4 md:p-6 md:bg-white md:rounded-2xl md:shadow-lg hover:shadow-xl transition-all duration-300 group md:border md:border-gray-100"
          >
            <div className="bg-black p-3 md:p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <div className="w-8 h-8 md:w-6 md:h-6 text-white font-bold flex items-center justify-center text-sm md:text-sm">
                TT
              </div>
            </div>
            <div className="flex-1 min-w-0 hidden md:block">
              <h4 className="font-semibold text-gray-800 group-hover:text-black transition-colors text-sm md:text-base">
                TikTok
              </h4>
              <p className="text-gray-600 text-xs md:text-sm">@pawship.id</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
