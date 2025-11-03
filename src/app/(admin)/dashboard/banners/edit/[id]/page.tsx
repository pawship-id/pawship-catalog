"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import FormBanner from "@/components/admin/banners/form-banner";

interface Banner {
  _id: string;
  title: string;
  description?: string;
  page: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  button: {
    text?: string;
    url?: string;
    color?: string;
    position?: string;
  };
  style: {
    textColor?: string;
    overlayColor?: string;
    textPosition?: string;
  };
  order: number;
  isActive: boolean;
}

export default function EditBannerPage() {
  const params = useParams();
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/api/admin/banners/${params.id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setBanner(result.data);
          } else {
            router.push("/dashboard/banners");
          }
        } else {
          router.push("/dashboard/banners");
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
        router.push("/dashboard/banners");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBanner();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading banner...</div>
      </div>
    );
  }

  if (!banner) {
    return null;
  }

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
          <h1 className="text-3xl font-bold">Edit Banner</h1>
          <p className="text-gray-600 mt-1">Update banner information</p>
        </div>
      </div>

      {/* Form */}
      <FormBanner
        mode="edit"
        initialData={banner}
        bannerId={params.id as string}
      />
    </div>
  );
}
