import { Badge } from "@/components/ui/badge";
import { OrderData } from "@/lib/types/order";

interface OrderStatusBadgeProps {
  status: OrderData["status"];
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderData["status"]) => {
    switch (status) {
      case "pending confirmation":
        return { variant: "outline" as const, color: "text-orange-600" };
      case "paid":
        return { variant: "outline" as const, color: "text-yellow-600" };
      case "processing":
        return { variant: "outline" as const, color: "text-blue-600" };
      case "shipped":
        return { variant: "outline" as const, color: "text-green-600" };
      default:
        return { variant: "secondary" as const, color: "text-gray-600" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.color}>
      {status}
    </Badge>
  );
}
