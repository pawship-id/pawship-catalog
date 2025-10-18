import React from "react";

interface LoadingPageProps {
  text?: string;
}

export default function LoadingPage({
  text = "Please wait a moment.",
}: LoadingPageProps) {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
      <p className="mt-1 text-sm text-gray-500">{text}</p>
    </div>
  );
}
