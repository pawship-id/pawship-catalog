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
import MultiSelectDropdown from "@/components/admin/collections/multi-select-dropdown";

interface CollectionFormProps {
  initialData?: any;
  collectionId?: string;
}

interface CollectionForm {
  name: string;
  displayOnHomepage: boolean;
  rules: "tag" | "category" | "custom" | "";
  ruleIds: string[];
}

const initialFormState: CollectionForm = {
  name: "",
  displayOnHomepage: false,
  rules: "",
  ruleIds: [],
};

export default function FormCollection({
  initialData,
  collectionId,
}: CollectionFormProps) {
  const [formData, setFormData] = useState<CollectionForm>(initialFormState);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!collectionId;
  const router = useRouter();

  // State for fetching options based on rule type
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState<Array<{ _id: string; name: string }>>(
    []
  );

  // Fetch options based on selected rule type
  const fetchOptions = async (ruleType: string) => {
    if (!ruleType) {
      setOptions([]);
      return;
    }

    try {
      setLoadingOptions(true);
      let endpoint = "";

      switch (ruleType) {
        case "category":
          endpoint = "/api/admin/categories";
          break;
        case "tag":
          endpoint = "/api/admin/tags";
          break;
        case "custom":
          endpoint = "/api/admin/products";
          break;
      }

      const response = await getAll<any>(endpoint);

      if (response.data?.length) {
        // Map response data to consistent format { _id, name }
        const mappedOptions = response.data.map((item: any) => ({
          _id: item._id,
          name: item.name || item.tagName || item.productName || "Unnamed",
        }));
        setOptions(mappedOptions);
      } else {
        setOptions([]);
      }
    } catch (err: any) {
      console.error("Error fetching options:", err);
      showErrorAlert("Error", err.message);
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  // Fetch options when rule type changes
  useEffect(() => {
    if (formData.rules) {
      fetchOptions(formData.rules);
    } else {
      setOptions([]);
    }
  }, [formData.rules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      showErrorAlert("Validation Error", "Collection name is required");
      return;
    }

    if (!formData.rules) {
      showErrorAlert("Validation Error", "Please select a rule type");
      return;
    }

    if (formData.ruleIds.length === 0) {
      showErrorAlert(
        "Validation Error",
        "Please select at least one item for the collection"
      );
      return;
    }

    setLoading(true);

    try {
      let response: ApiResponse<any>;

      const dataToSend = {
        name: formData.name,
        displayOnHomepage: formData.displayOnHomepage,
        rules: formData.rules,
        ruleIds: formData.ruleIds,
      };

      if (!isEditMode) {
        response = await createData<any, typeof dataToSend>(
          "/api/admin/collections",
          dataToSend
        );
      } else {
        response = await updateData<any, typeof dataToSend>(
          "/api/admin/collections",
          collectionId,
          dataToSend
        );
      }

      showSuccessAlert(undefined, response.message);
      router.push("/dashboard/collections");
    } catch (err: any) {
      showErrorAlert(undefined, err.message);
    } finally {
      setLoading(false);
    }
  };

  console.log(formData);

  const handleRuleIdsDropdownChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      ruleIds: selected,
    }));
  };

  const getRuleLabel = () => {
    switch (formData.rules) {
      case "category":
        return "categories";
      case "tag":
        return "tags";
      case "custom":
        return "products";
      default:
        return "items";
    }
  };

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        displayOnHomepage: initialData.displayOnHomepage || false,
        rules: initialData.rules || "",
        ruleIds: initialData.ruleIds || [],
      });
    }
  }, [initialData]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 md:space-y-4"
      autoComplete="off"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Collection Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium text-gray-700">
            Collection Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter collection name"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
            autoFocus
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Rule Type */}
        <div className="space-y-2">
          <Label
            htmlFor="rule-type"
            className="text-base font-medium text-gray-700"
          >
            Rule Type
          </Label>
          <Select
            value={formData.rules}
            onValueChange={(value) =>
              setFormData({ ...formData, rules: value as any, ruleIds: [] })
            }
          >
            <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full">
              <SelectValue placeholder="Select rule type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="tag">Tag</SelectItem>
              <SelectItem value="custom">
                Custom (Manual Product Selection)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            {formData.rules === "category" &&
              "Products will be automatically included based on selected categories"}
            {formData.rules === "tag" &&
              "Products will be automatically included based on selected tags"}
            {formData.rules === "custom" &&
              "Manually select specific products to include in this collection"}
          </p>
        </div>
      </div>

      {/* Items Selection based on Rule Type */}
      <div className="space-y-2">
        {formData.rules && (
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Select{" "}
              {formData.rules === "category"
                ? "Categories"
                : formData.rules === "tag"
                  ? "Tags"
                  : "Products"}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <MultiSelectDropdown
              options={options}
              selectedIds={formData.ruleIds}
              onChange={handleRuleIdsDropdownChange}
              placeholder={`Select ${getRuleLabel()}`}
              searchPlaceholder={`Search ${getRuleLabel()}...`}
              label={getRuleLabel()}
              loading={loadingOptions}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium text-gray-700">
          Display on Home Page
        </Label>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="displayed-no"
              name="displayOnHomepage"
              value="false"
              checked={formData.displayOnHomepage === false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOnHomepage: e.target.value === "true",
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
              name="displayOnHomepage"
              value="true"
              checked={formData.displayOnHomepage === true}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOnHomepage: e.target.value === "true",
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          type="submit"
          disabled={loading}
          className="px-6 w-full sm:w-auto"
        >
          {loading
            ? "Loading..."
            : isEditMode
              ? "Update Collection"
              : "Create Collection"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="px-6 w-full sm:w-auto"
          asChild
        >
          <Link href="/dashboard/collections">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
