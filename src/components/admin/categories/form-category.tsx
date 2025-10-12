"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { useRouter } from "next/navigation";
import { createData, getAll, updateData } from "@/lib/apiService";
import { ApiResponse } from "@/lib/types/api";
import { CategoryData, CategoryForm } from "@/lib/types/category";

interface CategoryFormProps {
  initialData?: any;
  categoryId?: string;
}

const initialFormState: CategoryForm = {
  name: "",
  image: null,
  isDisplayed: false,
  isSubCategory: false,
  parentCategoryId: "",
};

export default function FormCategory({
  initialData,
  categoryId,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryForm>(initialFormState);

  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isEditMode = !!categoryId;
  const router = useRouter();

  const [loadingFetchCategory, setLoadingFetchCategory] = useState(false);
  const [errorFetchCategory, setErrorFetchCategory] = useState<string | null>(
    null
  );
  const [parentCategoryList, setParentCategoryList] = useState<CategoryData[]>(
    []
  );

  const fetchCategories = async () => {
    try {
      setLoadingFetchCategory(true);
      setErrorFetchCategory(null);

      const response = await getAll<CategoryData>("/api/admin/categories");

      if (response.data?.length) {
        const filterParentCategory = response.data.filter(
          (item) =>
            !item.isSubCategory && (!isEditMode || item._id !== categoryId)
        );

        setParentCategoryList(filterParentCategory);
      }
    } catch (err: any) {
      setErrorFetchCategory(err.message);
    } finally {
      setLoadingFetchCategory(false);
    }
  };

  useEffect(() => {
    if (formData.isSubCategory && !parentCategoryList.length) {
      fetchCategories();
    }
  }, [formData.isSubCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = new FormData();

    dataToSend.append("name", formData.name);
    dataToSend.append("isDisplayed", formData.isDisplayed.toString());
    dataToSend.append("isSubCategory", formData.isSubCategory.toString());

    if (formData.isSubCategory && formData.parentCategoryId) {
      dataToSend.append("parentCategoryId", formData.parentCategoryId);
    }

    if (formData.image) {
      dataToSend.append("image", formData.image);

      if (formData.image instanceof File) {
        dataToSend.append("isNewImage", "true"); // signal to backend that there is a new file
      } else if (isEditMode && typeof formData.image === "string") {
        dataToSend.append("isNewImage", "false"); // signal to backend that there is no new file
      }
    }

    try {
      let response: ApiResponse<CategoryData>;

      if (!isEditMode) {
        response = await createData<CategoryData, FormData>(
          "/api/admin/categories",
          dataToSend
        );
      } else {
        response = await updateData<CategoryData, FormData>(
          "/api/admin/categories",
          categoryId,
          dataToSend
        );
      }

      showSuccessAlert(undefined, response.message);

      router.push("/dashboard/categories");
    } catch (err: any) {
      showErrorAlert(undefined, err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        image: initialData.imageUrl || null,
        isDisplayed: initialData.isDisplayed || false,
        isSubCategory: initialData.isSubCategory || false,
        parentCategoryId: initialData.parentCategoryId || "",
      });

      if (initialData.imageUrl) {
        setPreviewUrl(initialData.imageUrl);
      }
    }
  }, [initialData]);

  return (
    <form
      className="space-y-2 md:space-y-4"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium text-gray-700">
            Category Name *
          </Label>
          <Input
            id="name"
            placeholder="Enter category name"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            required
            autoFocus
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="image"
            className="text-base font-medium text-gray-700"
          >
            Category Image
          </Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              let url: string | null = null;

              if (file) {
                setFormData((prev) => ({
                  ...prev,
                  image: file,
                }));
                url = URL.createObjectURL(file);
              } else {
                setFormData((prev) => ({
                  ...prev,
                  image:
                    isEditMode && initialData?.imageUrl
                      ? initialData.imageUrl
                      : null,
                }));
              }

              setPreviewUrl(
                url ||
                  (isEditMode && initialData?.imageUrl
                    ? initialData.imageUrl
                    : null)
              );
            }}
          />

          <div className="flex justify-between items-center mt-2">
            <small className="text-destructive text-sm">
              * Maximum input 1 image
            </small>
            {previewUrl && (
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium cursor-pointer"
              >
                Show image
              </button>
            )}
          </div>

          {/* Image Modal */}
          {showImageModal && previewUrl && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Category Image Preview
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <img
                  src={previewUrl}
                  alt="Category preview"
                  className="w-full h-auto object-cover rounded-lg border border-gray-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-700">
            Sub Category
          </Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="subCategory-no"
                name="isSubCategory"
                value="false"
                checked={formData.isSubCategory === false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isSubCategory: e.target.value === "true",
                  })
                }
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="subCategory-no" className="text-sm font-normal">
                No
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="subCategory-yes"
                name="isSubCategory"
                value="true"
                checked={formData.isSubCategory === true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isSubCategory: e.target.value === "true",
                  })
                }
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="subCategory-yes" className="text-sm font-normal">
                Yes
              </Label>
            </div>
          </div>
        </div>

        {formData.isSubCategory && (
          <div className="space-y-2">
            <Label
              htmlFor="parentCategoryId"
              className="text-base font-medium text-gray-700"
            >
              Parent Category
            </Label>
            <Select
              value={formData.parentCategoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, parentCategoryId: value })
              }
              required
            >
              <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full">
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                {loadingFetchCategory ? (
                  <SelectItem value="loading-fetch-category" disabled>
                    Loading ...
                  </SelectItem>
                ) : errorFetchCategory ? (
                  <SelectItem value="error-fetch-category" disabled>
                    ERROR: {errorFetchCategory}
                  </SelectItem>
                ) : parentCategoryList.length > 0 ? (
                  parentCategoryList.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-categories" disabled>
                    No parent categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-700">
            Displayed on the website
          </Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="displayed-no"
                name="isDisplayed"
                value="false"
                checked={formData.isDisplayed === false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isDisplayed: e.target.value === "true",
                  })
                }
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="displayed-no" className="text-sm font-normal">
                No
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="displayed-yes"
                name="isDisplayed"
                value="true"
                checked={formData.isDisplayed === true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isDisplayed: e.target.value === "true",
                  })
                }
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="displayed-yes" className="text-sm font-normal">
                Yes
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          type="submit"
          disabled={loading}
          className="px-6 w-full sm:w-auto"
        >
          {loading
            ? "Loading..."
            : isEditMode
              ? "Update Category"
              : "Create Category"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="px-6 w-full sm:w-auto"
          asChild
        >
          <Link href="/dashboard/categories">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
