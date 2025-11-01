import { ArrowLeft, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface ErrorPageProps {
  errorMessage: string;
  url?: string;
}

export default function ErrorPublicPage({
  errorMessage,
  url = "/",
}: ErrorPageProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
      <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-xl border border-gray-100">
        <div className="text-center space-y-8 max-w-lg">
          {/* Logo */}
          <div className="mx-auto w-25 h-25 bg-muted rounded-full flex items-center justify-center">
            <TriangleAlert className="w-15 h-15 text-red-600" />
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-playfair font-bold text-foreground">
              Error
            </h1>
            <p className="text-xl text-muted-foreground px-4">{errorMessage}</p>
          </div>

          {url && (
            <Button
              variant="outline"
              size="lg"
              asChild
              className="inline-flex items-center gap-2 py-6 cursor-pointer border-foreground/20 text-foreground hover:bg-foreground hover:text-background"
            >
              <Link href={url}>
                <ArrowLeft className="w-7 h-7" />
                Back to Previous Page
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
