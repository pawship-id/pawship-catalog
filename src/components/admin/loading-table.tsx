import React from "react";

interface LoadingTableProps {
  text?: string;
}
export default function LoadingTable({
  text = "Loading...",
}: LoadingTableProps) {
  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}
