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
import { Edit, MoreVertical } from "lucide-react";
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

export default function TableUser() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAll<UserData>("/api/admin/users");

      if (response.data?.length) {
        setUsers(response.data);
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

  if (loading) {
    return <LoadingTable text="Loading fetch users..." />;
  }

  if (error) {
    return <ErrorTable error={error} handleClick={fetchUsers} />;
  }

  return (
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
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
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
  );
}
