import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Info, Plus } from "lucide-react";
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
            📐 Recommended Image Sizes:
          </h4>
          <div className="text-sm text-blue-800 space-y-2 ml-4">
            <div className="bg-blue-100 p-2 rounded">
              <strong>Home Page Banner</strong>
              <ul className="mt-1 space-y-1">
                <li>
                  • Desktop: <strong>1920 × 1080px (16:9)</strong> • Max 2MB
                </li>
                <li>
                  • Mobile: <strong>720 × 1280px (9:16)</strong> • Max 1MB
                </li>
              </ul>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <strong>Other Pages Banner</strong>
              <ul className="mt-1 space-y-1">
                <li>
                  • Desktop: <strong>1920 × 650px (3:1)</strong> • Max 2MB
                </li>
                <li>
                  • Mobile: <strong>768 × 400px (1.92:1)</strong> • Max 1MB
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-blue-900 mb-1">
            ⚠️ Important Notes:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>
              • <strong>Design text in image</strong> - Use safe zones (64px
              desktop, 32px mobile)
            </li>
            <li>
              • <strong>Button positioning</strong> - Horizontal
              (left/center/right) and Vertical (top/center/bottom)
            </li>
            <li>
              • <strong>Format</strong> - JPG, PNG, or WebP (WebP recommended
              for smaller size)
            </li>
            <li>
              • <strong>Create 2 versions</strong> - Desktop (landscape) &
              Mobile (portrait) for best results
            </li>
          </ul>
        </div>
      </div>

      {/* Banner Table */}
      <TableBanner />
    </div>
  );
}
