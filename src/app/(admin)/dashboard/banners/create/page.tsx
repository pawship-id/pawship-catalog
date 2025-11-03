import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import FormBanner from "@/components/admin/banners/form-banner";

export const metadata: Metadata = {
  title: "Create Banner | Pawship Dashboard",
  description: "Create a new banner",
};

export default function CreateBannerPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/banners">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Banner</h1>
          <p className="text-gray-600 mt-1">
            Add a new banner for your public pages
          </p>
        </div>
      </div>

      {/* Form */}
      <FormBanner mode="create" />
    </div>
  );
}
