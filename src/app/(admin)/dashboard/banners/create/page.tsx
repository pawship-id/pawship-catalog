import { Metadata } from "next";
import FormBanner from "@/components/admin/banners/form-banner";

export const metadata: Metadata = {
  title: "Create Banner | Pawship Dashboard",
  description: "Create a new banner",
};

export default function CreateBannerPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Form Add Banner
        </h1>
        <p className="text-muted-foreground text-lg">
          Create a new banner for your public pages
        </p>
      </div>

      {/* Form */}
      <FormBanner mode="create" />
    </div>
  );
}
