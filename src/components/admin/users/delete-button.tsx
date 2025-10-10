"use client";

import { Button } from "@/components/ui/button";
import { deleteById } from "@/lib/apiService";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/lib/helpers/sweetalert2";
import { Loader, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface DeleteButtonProps {
  userId: string;
  onFetch: () => void;
}

export default function DeleteButton({ userId, onFetch }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const resConfirm = await showConfirmAlert(
      "Are you sure you want to delete this data?",
      "Delete"
    );

    if (resConfirm.isConfirmed) {
      setLoading(true);

      try {
        await deleteById("/api/users", userId);

        showSuccessAlert(undefined, "Successfully deleted user!");

        onFetch();
      } catch (err: any) {
        showErrorAlert(undefined, err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive"
    >
      {loading ? <Loader className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}
