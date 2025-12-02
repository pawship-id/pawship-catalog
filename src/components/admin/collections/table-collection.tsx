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

interface TableCollectionProps {
  searchQuery: string;
}

export default function TableCollection({ searchQuery }: TableCollectionProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [copied, setCopied] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Calculate pagination
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCollections = filteredCollections.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<Collection>("/api/admin/collections");

      if (response.data) {
        setCollections(response.data);
        setFilteredCollections(response.data);
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

  // Search filter effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCollections(collections);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = collections.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
    setFilteredCollections(filtered);
  }, [searchQuery, collections]);

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
    <div className="space-y-4">
      {/* Results Counter */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredCollections.length} collection
          {filteredCollections.length !== 1 ? "s" : ""} matching "{searchQuery}"
        </div>
      )}

      {/* Table */}
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
            {filteredCollections.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery
                    ? `No collections found matching "${searchQuery}"`
                    : "No collections found"}
                </TableCell>
              </TableRow>
            ) : (
              currentCollections.map((item) => (
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
                          <Link
                            href={`/dashboard/collections/edit/${item._id}`}
                          >
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
      </div>

      {/* Pagination */}
      {filteredCollections.length > 0 && (
        <div className="flex items-center justify-between my-6">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredCollections.length)} of{" "}
            {filteredCollections.length} collections
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="cursor-pointer w-10"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}

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
