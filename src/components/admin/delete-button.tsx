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
  id: string;
  onFetch: () => void;
  resource: string;
}

export default function DeleteButton({
  id,
  onFetch,
  resource,
}: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const resConfirm = await showConfirmAlert(
      "Are you sure you want to delete this data?",
      "Delete"
    );

    if (resConfirm.isConfirmed) {
      setLoading(true);

      try {
        await deleteById(`/api/admin/${resource}`, id);

        showSuccessAlert(undefined, "Successfully deleted data!");

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
      className="w-full justify-start cursor-pointer"
    >
      {loading ? <Loader className="animate-spin" /> : <Trash2 />}
      <span className="ml-2">Delete</span>
    </Button>
  );
}
