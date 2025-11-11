"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  CircleCheckBig,
  Clock,
  CreditCard,
  Eye,
  Loader,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { OrderData } from "@/lib/types/order";
import { currencyFormat } from "@/lib/helpers";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { OrderStatusBadge } from "./order-status-badge";

interface TableOrderProps {
  onUpdateStatus: (orderId: string, status: OrderData["status"]) => void;
  isLoading: boolean;
  orders: OrderData[];
}

export default function TableOrder({
  onUpdateStatus,
  isLoading,
  orders,
}: TableOrderProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">
                  {item.invoiceNumber}
                </TableCell>
                <TableCell>{item.shippingAddress.fullName}</TableCell>
                <TableCell className="text-muted-foreground">
                  <Badge variant="outline">{item.orderType}</Badge>
                </TableCell>
                <TableCell>
                  <span className="capitalize">
                    {currencyFormat(
                      item.totalAmount + item.shippingCost,
                      item.currency
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <Select
                    value={item.status}
                    onValueChange={(value) =>
                      onUpdateStatus(item._id, value as OrderData["status"])
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-auto min-w-[150px] font-semibold">
                      <OrderStatusBadge status={item.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="pending confirmation"
                        className="text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-900/20"
                      >
                        <div className="flex items-center gap-2">
                          <Clock />
                          Pending Confirmation
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="paid"
                        className="text-yellow-600 focus:bg-indigo-50 dark:focus:bg-yellow-900/20"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard />
                          Paid
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="processing"
                        className="text-cyan-600 focus:bg-cyan-50 dark:focus:bg-cyan-900/20"
                      >
                        <div className="flex items-center gap-2">
                          <Loader />
                          Processing
                        </div>
                      </SelectItem>

                      <SelectItem
                        value="shipped"
                        className="text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20"
                      >
                        <div className="flex items-center gap-2">
                          <CircleCheckBig />
                          Shipped
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(item.orderDate).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/dashboard/orders/${item._id}/detail`}>
                          <Eye className="mr-2 h-4 w-4" /> Detail
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
