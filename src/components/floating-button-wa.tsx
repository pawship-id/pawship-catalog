"use client";
import React from "react";

export default function FloatingButtonWA() {
  const handleWhatsAppRedirect = () => {
    const message = encodeURIComponent(
      "Hello, I’d like to know more about your product."
    );
    const phone = "+6281231351150"; // Replace with actual phone number
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppRedirect}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
    >
      {/* Ikon WhatsApp pakai Lucide */}
      <img src="/images/icon-wa.png" className="w-6 h-6" />
    </button>
  );
}
