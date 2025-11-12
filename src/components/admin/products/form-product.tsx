"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useMemo, useState } from "react";
import { CategoryData } from "@/lib/types/category";
import { createData, getAll, updateData } from "@/lib/apiService";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Save,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { VariantEditor } from "./varian-editor";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import {
  ProductData,
  ProductForm,
  VariantRowForm,
  VariantType,
} from "@/lib/types/product";
import { ApiResponse } from "@/lib/types/api";
import { useRouter } from "next/navigation";
import TagInput from "./input-tag";
import { TagForm } from "@/lib/types/tag";

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

const getVariantRows = (): VariantRowForm[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const storedData = localStorage.getItem("variantRows");
  return JSON.parse(storedData || "[]") as VariantRowForm[];
};

const initialFormState: ProductForm = {
  productName: "",
  categoryId: "",
  moq: 1,
  productDescription: "",
  sizeProduct: null,
  productMedia: [],
  tags: [] as TagForm[],
  exclusive: { enabled: false, country: [] as string[] },
  preOrder: { enabled: false, leadTime: "" },
  variantTypes: [] as VariantType[],
  variantRows: getVariantRows(),
  marketingLinks: [] as string[],
};

export default function FormProduct({
  initialData,
  productId,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductForm>(initialFormState);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!productId;
  const router = useRouter();

  const [inputTagValue, setInputTagValue] = useState<
    { isNew: boolean; tagName: string }[]
  >([]);

  const [previewSizeProduct, setPreviewSizeProduct] = useState<string | null>(
    null
  );
  const [showSizeProductModal, setShowSizeProductModal] = useState(false);

  const [variantRows, setVariantRows] =
    useState<VariantRowForm[]>(getVariantRows());
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);

  const [loadingFetchCategory, setLoadingFetchCategory] = useState(false);
  const [errorFetchCategory, setErrorFetchCategory] = useState<string | null>(
    null
  );
  const [categoryList, setCategoryList] = useState<CategoryData[]>([]);
  const fetchCategories = async () => {
    try {
      setLoadingFetchCategory(true);

      setErrorFetchCategory(null);

      const response = await getAll<CategoryData>("/api/admin/categories");

      if (response.data) {
        setCategoryList(response.data);
      }
    } catch (err: any) {
      setErrorFetchCategory(err.message);
    } finally {
      setLoadingFetchCategory(false);
    }
  };

  const tabMenu = [
    { value: "product-details", label: "Product Details" },
    { value: "variations-pricing", label: "Variation & Pricing" },
    { value: "additional", label: "Additional" },
  ];

  const [activeTab, setActiveTab] = useState(tabMenu[0].value);
  const currentTabIndex = tabMenu.findIndex((tab) => tab.value === activeTab);

  // function to move to the next tab
  const handleNextTab = () => {
    if (currentTabIndex < tabMenu.length - 1) {
      setActiveTab(tabMenu[currentTabIndex + 1].value);
    }
  };

  // function to move to the previous tab
  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabMenu[currentTabIndex - 1].value);
    }
  };

  const [newMarketingLink, setNewMarketingLink] = useState("");

  const addMarketingLink = () => {
    if (
      newMarketingLink.trim() !== "" &&
      !formData.marketingLinks.includes(newMarketingLink.trim())
    ) {
      setFormData((prevData) => ({
        ...prevData,
        marketingLinks: [...prevData.marketingLinks, newMarketingLink.trim()],
      }));
      setNewMarketingLink("");
    } else if (newMarketingLink.trim() === "") {
      showErrorAlert(undefined, "Link cannot be empty.");
    } else {
      showErrorAlert(undefined, "The link is already in the list.");
    }
  };

  const removeMarketingLink = (link: string) => {
    setFormData((prev) => ({
      ...prev,
      marketingLinks: prev.marketingLinks.filter((l) => l !== link),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.categoryId || formData.categoryId.trim() === "") {
        throw new Error("Please input a category");
      }

      // create FormData for file upload
      const formDataToSend = new FormData();

      // add basic fields
      formDataToSend.append("productName", formData.productName);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("moq", formData.moq.toString());
      formDataToSend.append("productDescription", formData.productDescription);
      formDataToSend.append("tags", JSON.stringify(formData.tags));

      // add size product image if exists
      if (formData.sizeProduct) {
        formDataToSend.append("sizeProduct", formData.sizeProduct);
      }

      // add product media files
      if (formData.productMedia && formData.productMedia.length > 0) {
        formData.productMedia.forEach((file) => {
          formDataToSend.append("productMedia", file);
        });
      }

      // add exclusive data as JSON string
      formDataToSend.append("exclusive", JSON.stringify(formData.exclusive));

      // add preOrder data as JSON string
      formDataToSend.append("preOrder", JSON.stringify(formData.preOrder));

      // add variant types as JSON string
      formDataToSend.append(
        "variantTypes",
        JSON.stringify(formData.variantTypes)
      );

      // convert variant rows to JSON string
      formDataToSend.append(
        "variantRows",
        JSON.stringify(formData.variantRows)
      );

      // add marketing links as JSON string
      formDataToSend.append(
        "marketingLinks",
        JSON.stringify(formData.marketingLinks)
      );

      let response: ApiResponse<ProductData>;

      if (!isEditMode) {
        response = await createData<ProductData, FormData>(
          "/api/admin/products",
          formDataToSend
        );
      } else {
        response = await updateData<ProductData, FormData>(
          "/api/admin/products",
          productId,
          formDataToSend
        );
      }

      showSuccessAlert(undefined, response.message);

      localStorage.removeItem("variantRows");

      router.push("/dashboard/products");
    } catch (err: any) {
      showErrorAlert(undefined, err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    localStorage.setItem("variantRows", JSON.stringify(variantRows));
  }, [variantRows]);

  return (
    <>
      <form
        className="space-y-2 md:space-y-4"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {tabMenu.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="product-details" className="space-y-4 my-3">
            <div className="space-y-2">
              <Label
                htmlFor="productName"
                className="text-base font-medium text-gray-700"
              >
                Product Name *
              </Label>
              <Input
                id="productName"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                className="border-gray-300 py-5"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="categoryId"
                  className="text-base font-medium text-gray-700"
                >
                  Category *
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                  required
                >
                  <SelectTrigger
                    id="categoryId"
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5 w-full"
                  >
                    <SelectValue placeholder="Select category" />
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
                    ) : categoryList.length > 0 ? (
                      categoryList.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="moq"
                  className="text-base font-medium text-gray-700"
                >
                  MOQ
                </Label>
                <div>
                  <Input
                    id="moq"
                    type="number"
                    min={1}
                    placeholder="Enter MOQ"
                    value={formData.moq || 1}
                    onChange={(e) =>
                      setFormData({ ...formData, moq: Number(e.target.value) })
                    }
                    className="border-gray-300 py-5"
                    required
                  />
                  <small>Default MOQ is 1</small>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="productDescription"
                className="text-base font-medium text-gray-700"
              >
                Product Description *
              </Label>
              <Textarea
                id="productDescription"
                placeholder="Enter description"
                value={formData.productDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productDescription: e.target.value,
                  })
                }
                className="border-gray-300 py-5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="imageSizeProduct"
                className="text-base font-medium text-gray-700"
              >
                Upload Size Product
              </Label>
              <Input
                id="imageSizeProduct"
                type="file"
                accept="image/*"
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  let url: string | null = null;

                  if (file) {
                    setFormData((prev) => ({
                      ...prev,
                      sizeProduct: file,
                    }));
                    url = URL.createObjectURL(file);
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      sizeProduct:
                        isEditMode && initialData?.imageUrl
                          ? initialData.imageUrl
                          : null,
                    }));
                  }

                  setPreviewSizeProduct(
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
                {previewSizeProduct && (
                  <button
                    type="button"
                    onClick={() => setShowSizeProductModal(true)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium cursor-pointer"
                  >
                    Show image
                  </button>
                )}
              </div>

              {/* Image Modal */}
              {showSizeProductModal && previewSizeProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        Size Product Image Preview
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowSizeProductModal(false)}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <img
                      src={previewSizeProduct}
                      alt="Category preview"
                      className="w-full h-auto object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="productImageVideo"
                className="text-base font-medium text-gray-700"
              >
                Product Images & Videos
              </Label>
              <div className="relative py-1">
                <input
                  id="productImageVideo"
                  type="file"
                  multiple
                  disabled={formData.productMedia?.length === 9}
                  accept="image/*,video/*"
                  className={`absolute inset-0 w-full h-full opacity-0 z-10 ${formData.productMedia?.length === 9 ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);

                    if (files.length) {
                      // Limit to maximum 9 images
                      const filesToProcess = files.slice(0, 9);

                      setFormData((prev) => {
                        const existingMedia = prev.productMedia || [];
                        const combinedMedia = [
                          ...existingMedia,
                          ...filesToProcess,
                        ].slice(0, 9);
                        return { ...prev, productMedia: combinedMedia };
                      });

                      console.log("Selected files:", filesToProcess);
                    }
                  }}
                />
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images / video or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF, MP4, MOV, WEBM up to 5MB (Max 9 items)
                  </p>
                </div>
              </div>
              {formData.productMedia && formData.productMedia.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.productMedia?.map((image, index) => (
                    <Badge key={index} variant="secondary">
                      Media {index + 1}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            productMedia: prev.productMedia?.filter(
                              (_, i) => i !== index
                            ),
                          }))
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="tags"
                className="text-base font-medium text-gray-700"
              >
                Tags
              </Label>
              <TagInput
                onChange={(value) => {
                  setInputTagValue(value);

                  setFormData({
                    ...formData,
                    tags: value,
                  });
                }}
                tags={inputTagValue}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="exclusive"
                  className="data-[state=unchecked]:bg-gray-200"
                  checked={formData.exclusive.enabled}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      exclusive: { ...prev.exclusive, enabled: checked },
                    }));

                    if (checked === false) {
                      setFormData((prev) => ({
                        ...prev,
                        exclusive: { ...prev.exclusive, country: [] },
                      }));
                    }
                  }}
                />
                <Label htmlFor="exclusive">Exclusive Country</Label>
              </div>

              {formData.exclusive.enabled && (
                <div className="space-y-2">
                  <div className="my-2">
                    <Label
                      htmlFor="exclusiveCountry"
                      className="text-base font-medium text-gray-700"
                    >
                      Exclude Country
                    </Label>
                    <small>The countries checked are excluded countries</small>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-1 p-4 rounded-lg">
                    {[
                      "Indonesia",
                      "Singapora",
                      "Malaysia",
                      "Hongkong",
                      "Taiwan",
                      "Australia",
                    ].map((country) => (
                      <div
                        key={country}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`country-${country}`}
                          checked={
                            formData.exclusive?.country?.includes(country) ||
                            false
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                exclusive: {
                                  ...prev.exclusive,
                                  country: [
                                    ...(prev.exclusive.country || []),
                                    country,
                                  ],
                                },
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                exclusive: {
                                  ...prev.exclusive,
                                  country: (
                                    prev.exclusive.country || []
                                  ).filter((c) => c !== country),
                                },
                              }));
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <Label
                          htmlFor={`country-${country}`}
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {country}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pre-order"
                  className="data-[state=unchecked]:bg-gray-200"
                  checked={formData.preOrder.enabled}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      preOrder: { ...prev.preOrder, enabled: checked },
                    }));

                    if (checked === false) {
                      setFormData((prev) => ({
                        ...prev,
                        preOrder: { ...prev.preOrder, leadTime: "" },
                      }));
                    }
                  }}
                />
                <Label htmlFor="pre-order">Enable Pre-Order</Label>
              </div>

              {formData.preOrder.enabled && (
                <div className="space-y-2">
                  <Label
                    htmlFor="lead-time"
                    className="text-base font-medium text-gray-700"
                  >
                    Lead Time
                  </Label>
                  <Input
                    id="lead-time"
                    value={formData.preOrder.leadTime || ""}
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preOrder: {
                          ...prev.preOrder,
                          leadTime: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g., 2-3 weeks"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="variations-pricing" className="space-y-4 my-3">
            <div className="space-y-2">
              <Label className="text-base font-medium">Tipe Variasi</Label>
              <div className="mt-3">
                <VariantEditor
                  value={variantRows}
                  onChange={(next) => {
                    setVariantRows(next);

                    setFormData((prev) => {
                      return {
                        ...prev,
                        variantRows: next,
                      };
                    });
                  }}
                  variantTypes={variantTypes}
                  onTypesChange={(next) => {
                    setVariantTypes(next);
                    // sync back to formData.variants so the rest of the app keeps working
                    setFormData((prev) => ({
                      ...prev,
                      variantTypes: next.map((t) => ({
                        id: t.id,
                        name: t.name,
                      })),
                    }));
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4 my-3">
            <div className="space-y-2">
              <div>
                <Label
                  htmlFor="marketing-links"
                  className="text-base font-medium text-gray-700"
                >
                  Marketing Links
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="marketing-links"
                    placeholder="Add marketing link"
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                    value={newMarketingLink}
                    onChange={(e) => setNewMarketingLink(e.target.value)}
                  />
                  <Button
                    type="button"
                    className="py-5"
                    onClick={addMarketingLink}
                  >
                    <Plus className="h-8 w-8" />
                  </Button>
                </div>
                {formData.marketingLinks.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {formData.marketingLinks.map((link) => (
                      <div
                        key={link}
                        className="flex items-center justify-between bg-muted p-2 rounded"
                      >
                        <span className="text-sm truncate">{link}</span>
                        <button
                          type="button"
                          onClick={() => removeMarketingLink(link)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          {/* prev button*/}
          {currentTabIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              className="w-30 cursor-pointer"
              onClick={handlePrevTab}
            >
              <ChevronsLeft />
              Prev
            </Button>
          )}

          <div className={currentTabIndex === 0 ? "ml-auto" : ""}>
            {/* next button */}
            {currentTabIndex < tabMenu.length - 1 && (
              <Button
                type="button"
                className="w-36 cursor-pointer"
                onClick={handleNextTab}
              >
                Next
                <ChevronsRight />
              </Button>
            )}

            {/* submit button */}
            {currentTabIndex === tabMenu.length - 1 && (
              <Button
                type="submit"
                disabled={loading}
                className="w-36 cursor-pointer"
              >
                <Save />
                {loading
                  ? "Loading..."
                  : isEditMode
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
