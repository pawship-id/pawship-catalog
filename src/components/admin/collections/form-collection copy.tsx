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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import { useRouter } from "next/navigation";
import { createData, getAll, updateData } from "@/lib/apiService";
import { ApiResponse } from "@/lib/types/api";
import { Loader2 } from "lucide-react";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {/* Collection Name */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="name" className="text-base font-medium text-gray-700">
            Collection Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter collection name"
            className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Display on Homepage */}
        <div className="flex items-center space-x-2 mb-6">
          <Checkbox
            id="displayOnHomepage"
            checked={formData.displayOnHomepage}
            onCheckedChange={(checked) =>
              setFormData({
                ...formData,
                displayOnHomepage: checked as boolean,
              })
            }
          />
          <Label
            htmlFor="displayOnHomepage"
            className="text-sm font-medium cursor-pointer"
          >
            Display on Homepage
          </Label>
        </div>

        {/* Rule Type */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="rules" className="text-sm font-medium">
            Rule Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.rules}
            onValueChange={(value) =>
              setFormData({ ...formData, rules: value as any, ruleIds: [] })
            }
          >
            <SelectTrigger className="border-gray-300 focus:border-primary/80 focus:ring-primary/80">
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

        {/* Items Selection based on Rule Type */}
        {formData.rules && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
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

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Link href="/dashboard/collections">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300"
            disabled={loading}
          >
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : isEditMode ? (
            "Update Collection"
          ) : (
            "Create Collection"
          )}
        </Button>
      </div>
    </form>
  );
}
