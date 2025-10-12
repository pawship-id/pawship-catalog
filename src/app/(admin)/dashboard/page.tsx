import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, ShoppingCart, Users, FolderTree } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Products",
      value: "1,234",
      description: "Active products in catalog",
      icon: Package,
    },
    {
      title: "Total Orders",
      value: "856",
      description: "Orders this month",
      icon: ShoppingCart,
    },
    {
      title: "Total Users",
      value: "342",
      description: "Registered users",
      icon: Users,
    },
    {
      title: "Categories",
      value: "28",
      description: "Product categories",
      icon: FolderTree,
    },
  ];

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to your Pawship CMS admin dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 min-[570px]:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white shadow-md border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-md border">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{1000 + i}</p>
                    <p className="text-sm text-muted-foreground">
                      Customer {i}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(Math.random() * 100 + 50).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md border">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Product {i}</p>
                    <p className="text-sm text-muted-foreground">
                      Category {i}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {Math.floor(Math.random() * 100 + 20)} sold
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${(Math.random() * 50 + 10).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
