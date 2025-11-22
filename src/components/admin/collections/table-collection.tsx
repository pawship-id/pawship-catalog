"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, MoreVertical, Link2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAll } from "@/lib/apiService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import DeleteButton from "@/components/admin/delete-button";
import LoadingTable from "@/components/admin/loading-table";
import ErrorTable from "@/components/admin/error-table";
import Link from "next/link";

interface Collection {
  _id: string;
  name: string;
  slug: string;
  displayOnHomepage: boolean;
  displayOnNavbar: boolean;
  rules: "tag" | "category" | "custom";
  ruleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export default function TableCollection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<Collection>("/api/admin/collections");

      if (response.data) {
        setCollections(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  if (loading) {
    return <LoadingTable text="Loading collections" />;
  }

  if (error) {
    return <ErrorTable error={error} handleClick={fetchCollections} />;
  }

  const getRuleLabel = (rule: string) => {
    switch (rule) {
      case "category":
        return "Category";
      case "tag":
        return "Tag";
      case "custom":
        return "Custom";
      default:
        return rule;
    }
  };

  const handleShowUrl = (collection: Collection) => {
    setSelectedCollection(collection);
    setShowUrlModal(true);
    setCopied(false);
  };

  const handleCopyUrl = () => {
    if (selectedCollection) {
      const url = `${window.location.origin}/catalog?collection=${selectedCollection.slug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Rule Type</TableHead>
            <TableHead>Items Count</TableHead>
            <TableHead>Display on Homepage</TableHead>
            <TableHead>Display on Navbar</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No collections found
              </TableCell>
            </TableRow>
          ) : (
            collections.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <span className="inline-flex px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                    {getRuleLabel(item.rules)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {item.ruleIds.length} item(s)
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.displayOnHomepage
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.displayOnHomepage ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.displayOnNavbar
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.displayOnNavbar ? "Yes" : "No"}
                  </span>
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
                        <Link href={`/dashboard/collections/edit/${item._id}`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleShowUrl(item)}
                      >
                        <Link2 className="mr-2 h-4 w-4" /> Show URL
                      </DropdownMenuItem>
                      <DropdownMenuItem className="p-0">
                        <DeleteButton
                          id={item._id}
                          onFetch={fetchCollections}
                          resource="collections"
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* URL Modal */}
      <Dialog open={showUrlModal} onOpenChange={setShowUrlModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collection URL</DialogTitle>
            <DialogDescription>
              Copy the public URL for "{selectedCollection?.name}" collection
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={
                  selectedCollection
                    ? `${typeof window !== "undefined" ? window.location.origin : ""}/catalog?collection=${selectedCollection.slug}`
                    : ""
                }
                className="bg-gray-50"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="px-3"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
