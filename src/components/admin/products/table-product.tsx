import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function TableProduct() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="w-25 h-25 bg-muted rounded-md flex items-center justify-center">
                  <img
                    src="https://down-id.img.susercontent.com/file/sg-11134201-7rdxd-m0e23s2x3gz40b@resize_w900_nl.webp"
                    alt="Magician BIP Set"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div>
                  <p className="font-medium">Magician BIP Set</p>
                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                    Crafted from premium soft cotton, the Magician BIP Set
                    offers all-day comfort with a lightweight and breathable
                    feel. Gentle on the skin, it’s safe for babies and kids. The
                    playful magician-themed design makes it not only functional
                    but also stylish for everyday wear.
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                BIP-001
              </code>
            </TableCell>
            <TableCell>
              <Badge variant="outline">BIP/Collar</Badge>
            </TableCell>
            <TableCell>10</TableCell>
            <TableCell>
              <Badge variant="default">In Stock</Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href={`/dashboard/categories/edit/1`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0">
                    {/* <DeleteButton
                      id={item._id}
                      onFetch={fetchCategories}
                      resource="categories"
                    /> */}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
