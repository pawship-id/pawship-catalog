import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import TableBanner from "@/components/admin/banners/table-banner";

export const metadata: Metadata = {
  title: "Banners | Pawship Dashboard",
  description: "Manage banners for all public pages",
};

export default function BannersPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Banner Management</h1>
          <p className="text-gray-600 mt-1">
            Manage banners for all public pages (Home, Our Collection, Reseller,
            About Us, etc.)
          </p>
        </div>
        <Link href="/dashboard/banners/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-blue-900">Banner Guidelines</h3>

        <div>
          <h4 className="font-medium text-blue-900 mb-1">📍 Page Types:</h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>
              • <strong>Home:</strong> Multiple banners with carousel
              (auto-slide)
            </li>
            <li>
              • <strong>Other Pages:</strong> Single banner only (first active
              banner displayed)
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-blue-900 mb-1">
            📐 Image Size Recommendations:
          </h4>
          <div className="text-sm text-blue-800 space-y-2 ml-4">
            <div className="bg-blue-100 p-2 rounded">
              <strong>Home Page Banner (Carousel)</strong>
              <ul className="mt-1 space-y-1">
                <li>
                  • Desktop: <strong>1920x600px</strong> (Aspect Ratio: 3.2:1)
                </li>
                <li>
                  • Mobile: <strong>768x400px</strong> (Aspect Ratio: 1.92:1)
                </li>
                <li>• Display Height: 600px (desktop) / 400px (mobile)</li>
              </ul>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <strong>Other Pages Banner (Single)</strong>
              <ul className="mt-1 space-y-1">
                <li>
                  • Desktop: <strong>1920x400px</strong> (Aspect Ratio: 4.8:1)
                </li>
                <li>
                  • Mobile: <strong>768x300px</strong> (Aspect Ratio: 2.56:1)
                </li>
                <li>• Display Height: 400px (desktop) / 300px (mobile)</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-900 mb-1">💡 Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>
              • Mobile image is optional (fallback to desktop if not provided)
            </li>
            <li>• Use high-quality, optimized images (max 5MB)</li>
            <li>• Ensure text is readable on all backgrounds</li>
            <li>• Drag & drop to reorder banners within each page</li>
          </ul>
        </div>
      </div>

      {/* Banner Table */}
      <TableBanner />
    </div>
  );
}
