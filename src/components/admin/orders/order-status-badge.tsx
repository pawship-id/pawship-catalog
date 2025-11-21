import { Badge } from "@/components/ui/badge";
import { OrderData } from "@/lib/types/order";

interface OrderStatusBadgeProps {
  status: OrderData["status"];
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderData["status"]) => {
    switch (status) {
      case "pending confirmation":
        return {
          variant: "outline" as const,
          color: "text-orange-600 border-orange-600",
        };
      case "awaiting payment":
        return {
          variant: "outline" as const,
          color: "text-green-600 border-green-600",
        };
      case "payment confirmed":
        return {
          variant: "outline" as const,
          color: "text-blue-600 border-blue-600",
        };
      case "processing":
        return {
          variant: "outline" as const,
          color: "text-purple-600 border-purple-600",
        };
      case "shipped":
        return {
          variant: "outline" as const,
          color: "text-green-600 border-green-600",
        };
      default:
        return { variant: "secondary" as const, color: "text-gray-600" };
    }
  };

  const config = getStatusConfig(status);

  const formatStatusLabel = (status: string) => {
    return status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Badge variant={config.variant} className={config.color}>
      {formatStatusLabel(status)}
    </Badge>
  );
}
