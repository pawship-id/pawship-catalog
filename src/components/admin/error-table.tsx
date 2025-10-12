import React from "react";
import { Button } from "../ui/button";

interface ErrorTableProps {
  error: string;
  handleClick: () => void;
}

export default function ErrorTable({ error, handleClick }: ErrorTableProps) {
  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">Error: {error}</p>
          <Button onClick={handleClick} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
