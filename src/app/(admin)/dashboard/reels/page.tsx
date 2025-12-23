"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TableReel from "@/components/admin/reels/table-reel";
import FormReelModal from "@/components/admin/reels/form-reel-modal";

interface Reel {
  _id: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  link: string;
  show: boolean;
  order: number;
  likes: number;
  views: number;
}

export default function ReelsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Reel | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reel: Reel) => {
    setEditData(reel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reel Management</h1>
          <p className="text-gray-600 mt-1">
            Manage Instagram reels displayed on the homepage
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Reel
        </Button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📌 Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-4">
          <li>• Add Instagram reel thumbnail and link URL</li>
          <li>• Toggle &quot;Show&quot; to control visibility on homepage</li>
          <li>
            • Use &quot;Order&quot; field to control display sequence (lower =
            first)
          </li>
          <li>
            • Only reels with &quot;Show&quot; enabled appear on public page
          </li>
        </ul>
      </div>

      {/* Table */}
      <TableReel onEdit={handleEdit} refreshTrigger={refreshTrigger} />

      {/* Form Modal */}
      <FormReelModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editData={editData}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
