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
import { Edit, MoreVertical, User, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAll } from "@/lib/apiService";
import { UserData } from "@/lib/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import DeleteButton from "@/components/admin/delete-button";
import LoadingTable from "@/components/admin/loading-table";
import ErrorTable from "@/components/admin/error-table";
import ChangePasswordModal from "./change-password-modal";

interface TableUserProps {
  searchQuery: string;
}

export default function TableUser({ searchQuery }: TableUserProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changePasswordModal, setChangePasswordModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: "",
    userName: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<UserData>("/api/admin/users");

      if (response.data?.length) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search filter effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleOpenChangePassword = (userId: string, userName: string) => {
    setChangePasswordModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleCloseChangePassword = () => {
    setChangePasswordModal({
      isOpen: false,
      userId: "",
      userName: "",
    });
  };

  if (loading) {
    return <LoadingTable text="Loading fetch users..." />;
  }

  if (error) {
    return <ErrorTable error={error} handleClick={fetchUsers} />;
  }

  return (
    <div className="space-y-4">
      {/* Results Counter */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredUsers.length} user
          {filteredUsers.length !== 1 ? "s" : ""} matching "{searchQuery}"
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery
                    ? `No users found matching "${searchQuery}"`
                    : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.phoneNumber}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{user.role}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        !user.deleted
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {!user.deleted ? "Active" : "Non Active"}
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
                          <Link href={`/dashboard/users/edit/${user._id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        {(user.role === "reseller" ||
                          user.role === "retail") && (
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/dashboard/users/profile/${user._id}`}>
                              <User className="mr-2 h-4 w-4" /> Update Profile
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() =>
                            handleOpenChangePassword(user._id, user.fullName)
                          }
                        >
                          <KeyRound className="mr-2 h-4 w-4" /> Change Password
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-0">
                          <DeleteButton
                            id={user._id}
                            onFetch={fetchUsers}
                            resource="users"
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
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between my-6">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}{" "}
            users
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModal.isOpen}
        onClose={handleCloseChangePassword}
        userId={changePasswordModal.userId}
        userName={changePasswordModal.userName}
      />
    </div>
  );
}
