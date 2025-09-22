import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UnderDevelopmentProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
}

export default function UnderDevelopment({
  title,
  description,
  showBackButton = true,
}: UnderDevelopmentProps) {
  return (
    <div className="py-20">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-playfair font-bold text-foreground">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {description ||
                "This feature is currently under development and will be available soon."}
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                We're working hard to bring you this feature. Please check back
                later!
              </p>
              <p className="text-xs text-muted-foreground">
                Expected completion: Coming soon
              </p>
            </div>
            {showBackButton && (
              <div className="pt-4">
                <Button asChild variant="outline">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
