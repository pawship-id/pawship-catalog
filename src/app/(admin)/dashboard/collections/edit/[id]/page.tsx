"use client";
import { getById } from "@/lib/apiService";
import { useParams } from "next/navigation";
import FormCollection from "@/components/admin/collections/form-collection";
import React, { useEffect, useState } from "react";
import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";

interface Collection {
  _id: string;
  name: string;
  displayOnHomepage: boolean;
  rules: "tag" | "category" | "custom";
  ruleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export default function EditCollectionPage() {
  const params = useParams();
  const id = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetchCollectionById = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<Collection>("/api/admin/collections", id);

      if (response.data) {
        setCollection(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionById();
  }, [id]);

  return (
    <div>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-playfair font-bold text-foreground">
          Edit Collection
        </h1>
        <p className="text-muted-foreground text-lg">Update collection data</p>
      </div>

      {isLoading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/collections" />
      ) : (
        <FormCollection initialData={collection} collectionId={id} />
      )}
    </div>
  );
}
