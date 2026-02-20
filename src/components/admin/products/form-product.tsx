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
import RichTextEditor from "@/components/ui/rich-text-editor";
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
import Link from "next/link";
import { compressImagesIfNeeded } from "@/lib/helpers/image-compression";

interface ProductFormProps {
  initialData?: ProductData;
  mode?: "create" | "edit";
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
  sizeProduct: [],
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
  mode = "create",
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductForm>(initialFormState);
  const [loading, setLoading] = useState(false);
  const isEditMode = mode === "edit";
  const router = useRouter();

  const [inputTagValue, setInputTagValue] = useState<
    { isNew: boolean; tagName: string }[]
  >([]);

  const [previewSizeProduct, setPreviewSizeProduct] = useState<string[]>([]);
  const [showSizeProductModal, setShowSizeProductModal] = useState(false);
  const [currentSizeImageIndex, setCurrentSizeImageIndex] = useState(0);

  const [showProductMediaModal, setShowProductMediaModal] = useState(false);
  const [currentProductMediaIndex, setCurrentProductMediaIndex] = useState(0);

  // State untuk existing size images dari database (untuk edit mode)
  const [existingSizeProduct, setExistingSizeProduct] = useState<
    { imageUrl: string; imagePublicId: string }[]
  >([]);
  const [deleteSizeIds, setDeleteSizeIds] = useState<string[]>([]);

  // State untuk existing media dari database (untuk edit mode)
  const [existingProductMedia, setExistingProductMedia] = useState<
    { imageUrl: string; imagePublicId: string }[]
  >([]);
  const [deleteMediaIds, setDeleteMediaIds] = useState<string[]>([]);

  const [variantRows, setVariantRows] =
    useState<VariantRowForm[]>(getVariantRows());
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);

  const [loadingFetchCategory, setLoadingFetchCategory] = useState(false);
  const [errorFetchCategory, setErrorFetchCategory] = useState<string | null>(
    null,
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
      // Validasi minimal 1 size product
      const totalSizeProduct =
        (formData.sizeProduct?.length || 0) + existingSizeProduct.length;
      if (totalSizeProduct === 0) {
        throw new Error("Please upload at least 1 size product image");
      }

      // Validasi minimal 1 product media
      const totalProductMedia =
        (formData.productMedia?.length || 0) + existingProductMedia.length;
      if (totalProductMedia === 0) {
        throw new Error("Please upload at least 1 product image");
      }

      // Validasi minimal 1 variant
      if (!formData.variantRows || formData.variantRows.length === 0) {
        throw new Error("Please add at least 1 product variant");
      }

      // create FormData for file upload
      const formDataToSend = new FormData();

      // add basic fields
      formDataToSend.append("productName", formData.productName);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("moq", formData.moq.toString());
      formDataToSend.append("productDescription", formData.productDescription);
      formDataToSend.append("tags", JSON.stringify(formData.tags));

      // add size product images if exists
      if (formData.sizeProduct && formData.sizeProduct.length > 0) {
        formData.sizeProduct.forEach((file) => {
          formDataToSend.append("sizeProduct", file);
        });
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
        JSON.stringify(formData.variantTypes),
      );

      // convert variant rows to JSON string
      formDataToSend.append(
        "variantRows",
        JSON.stringify(formData.variantRows),
      );

      // add marketing links as JSON string
      formDataToSend.append(
        "marketingLinks",
        JSON.stringify(formData.marketingLinks),
      );

      // add delete media IDs for edit mode
      if (isEditMode && deleteMediaIds.length > 0) {
        formDataToSend.append("deleteMediaIds", JSON.stringify(deleteMediaIds));
      }

      // add delete size IDs for edit mode
      if (isEditMode && deleteSizeIds.length > 0) {
        formDataToSend.append("deleteSizeIds", JSON.stringify(deleteSizeIds));
      }

      let response: ApiResponse<ProductData>;

      if (!isEditMode) {
        response = await createData<ProductData, FormData>(
          "/api/admin/products",
          formDataToSend,
        );
      } else {
        response = await updateData<ProductData, FormData>(
          "/api/admin/products",
          initialData?._id as string,
          formDataToSend,
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

  // Populate form with initialData when in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        productName: initialData.productName || "",
        categoryId: initialData.categoryId || "",
        moq: initialData.moq || 1,
        productDescription: initialData.productDescription || "",
        sizeProduct: [], // Will be shown as preview
        productMedia: [], // Will be shown as previews from existingProductMedia
        tags: (initialData.tags || []).map((tag: any) => ({
          isNew: false,
          tagName: tag.tagName || tag,
          _id: tag._id,
        })),
        exclusive: initialData.exclusive || {
          enabled: false,
          country: [],
        },
        preOrder: initialData.preOrder || { enabled: false, leadTime: "" },
        variantTypes: initialData.variantTypes || [],
        variantRows: initialData.productVariantsData || [],
        marketingLinks: initialData.marketingLinks || [],
      });

      // Set variant types and rows from initial data
      if (initialData.variantTypes) {
        setVariantTypes(initialData.variantTypes);
      }
      if (initialData.productVariantsData) {
        setVariantRows(initialData.productVariantsData);
      }

      // Set tags
      if (initialData.tags) {
        setInputTagValue(
          initialData.tags.map((tag: any) => ({
            isNew: false,
            tagName: tag.tagName || tag,
          })),
        );
      }

      // Set size product previews
      if (
        initialData.sizeProduct &&
        Array.isArray(initialData.sizeProduct) &&
        initialData.sizeProduct.length > 0
      ) {
        setExistingSizeProduct(initialData.sizeProduct);
      }

      // Set existing product media
      if (initialData.productMedia && initialData.productMedia.length > 0) {
        setExistingProductMedia(initialData.productMedia);
      }
    }
  }, [isEditMode, initialData, categoryList]);

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
                Product Name <span className="text-red-500">*</span>
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
                  Category <span className="text-red-500">*</span>
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
                  MOQ Reseller
                </Label>
                <div>
                  <Input
                    id="moq"
                    type="number"
                    min={1}
                    placeholder="Enter MOQ reseller"
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
                Product Description <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor
                value={formData.productDescription}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    productDescription: value,
                  })
                }
                placeholder="Enter product description..."
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="imageSizeProduct"
                className="text-base font-medium text-gray-700"
              >
                Upload Size Product Images{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="imageSizeProduct"
                type="file"
                accept="image/*"
                multiple
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);

                  if (files.length > 0) {
                    try {
                      // Compress images if needed
                      const compressedFiles =
                        await compressImagesIfNeeded(files);

                      setFormData((prev) => ({
                        ...prev,
                        sizeProduct: [
                          ...(prev.sizeProduct || []),
                          ...compressedFiles,
                        ],
                      }));

                      const urls = compressedFiles.map((file) =>
                        URL.createObjectURL(file),
                      );
                      setPreviewSizeProduct((prev) => [...prev, ...urls]);
                    } catch (error: any) {
                      showErrorAlert(
                        "Image Compression Failed",
                        error.message || "Failed to compress image",
                      );
                    }
                  }
                }}
              />

              <div className="flex justify-between items-center mt-2">
                <small className="text-muted-foreground text-sm">
                  * You can upload multiple images
                </small>
                {(previewSizeProduct.length > 0 ||
                  existingSizeProduct.length > 0) && (
                  <small className="text-blue-500 text-sm font-medium">
                    {previewSizeProduct.length + existingSizeProduct.length}{" "}
                    image(s) selected
                  </small>
                )}
              </div>

              {/* Preview new size images */}
              {previewSizeProduct.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    New Size Media ({previewSizeProduct.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {previewSizeProduct.map((url, index) => (
                      <div key={`preview-${index}`} className="relative group">
                        <img
                          src={url}
                          alt={`New size ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => {
                            setCurrentSizeImageIndex(
                              existingSizeProduct.length + index,
                            );
                            setShowSizeProductModal(true);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewSizeProduct((prev) =>
                              prev.filter((_, i) => i !== index),
                            );
                            setFormData((prev) => ({
                              ...prev,
                              sizeProduct: (prev.sizeProduct || []).filter(
                                (_, i) => i !== index,
                              ),
                            }));
                          }}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 transition-opacity"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview existing size images */}
              {isEditMode && existingSizeProduct.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Existing Size Media ({existingSizeProduct.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {existingSizeProduct.map((img, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={img.imageUrl}
                          alt={`Size ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => {
                            setCurrentSizeImageIndex(index);
                            setShowSizeProductModal(true);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteSizeIds((prev) => [
                              ...prev,
                              img.imagePublicId,
                            ]);
                            setExistingSizeProduct((prev) =>
                              prev.filter((_, i) => i !== index),
                            );
                          }}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 transition-opacity"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Modal */}
              {showSizeProductModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg max-w-2xl w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        Size Product Image Preview ({currentSizeImageIndex + 1}/
                        {existingSizeProduct.length + previewSizeProduct.length}
                        )
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
                      src={
                        currentSizeImageIndex < existingSizeProduct.length
                          ? existingSizeProduct[currentSizeImageIndex].imageUrl
                          : previewSizeProduct[
                              currentSizeImageIndex - existingSizeProduct.length
                            ]
                      }
                      alt="Size product preview"
                      className="w-full h-auto object-contain rounded-lg border border-gray-300"
                    />
                    <div className="flex justify-between mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentSizeImageIndex((prev) =>
                            prev > 0
                              ? prev - 1
                              : existingSizeProduct.length +
                                previewSizeProduct.length -
                                1,
                          )
                        }
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentSizeImageIndex((prev) =>
                            prev <
                            existingSizeProduct.length +
                              previewSizeProduct.length -
                              1
                              ? prev + 1
                              : 0,
                          )
                        }
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="productImageVideo"
                className="text-base font-medium text-gray-700"
              >
                Product Images & Videos <span className="text-red-500">*</span>
                <span className="text-xs">(Max 9 items)</span>
              </Label>
              <div className="relative py-1">
                <input
                  id="productImageVideo"
                  type="file"
                  multiple
                  disabled={
                    [...(formData.productMedia || []), ...existingProductMedia]
                      .length === 9
                  }
                  accept="image/*,video/*"
                  className={`absolute inset-0 w-full h-full opacity-0 z-10 ${[...(formData.productMedia || []), ...existingProductMedia].length === 9 ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);

                    if (files.length) {
                      try {
                        // Separate images and videos
                        const images = files.filter((f) =>
                          f.type.startsWith("image/"),
                        );
                        const videos = files.filter((f) =>
                          f.type.startsWith("video/"),
                        );

                        // Compress images if needed
                        const compressedImages =
                          images.length > 0
                            ? await compressImagesIfNeeded(images)
                            : [];

                        // Combine compressed images with videos
                        const processedFiles = [...compressedImages, ...videos];

                        // Calculate total existing media
                        const totalExisting =
                          (formData.productMedia || []).length +
                          existingProductMedia.length;
                        const remainingSlots = 9 - totalExisting;

                        // Limit to remaining slots
                        const filesToProcess = processedFiles.slice(
                          0,
                          remainingSlots,
                        );

                        setFormData((prev) => {
                          const existingMedia = prev.productMedia || [];
                          const combinedMedia = [
                            ...existingMedia,
                            ...filesToProcess,
                          ];
                          return { ...prev, productMedia: combinedMedia };
                        });

                        console.log("Selected files:", filesToProcess);
                      } catch (error: any) {
                        showErrorAlert(
                          "Image Compression Failed",
                          error.message || "Failed to compress image",
                        );
                      }
                    }
                  }}
                />
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload images / video or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF, MP4, MOV, WEBM up to 5MB
                  </p>
                </div>
              </div>
              {/* Display new product media yang baru di-upload */}
              {formData.productMedia && formData.productMedia.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    New Product Media ({formData.productMedia.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {formData.productMedia?.map((file, index) => (
                      <div
                        key={index}
                        className="relative group w-20 h-20 md:w-24 md:h-24 rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New media ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => {
                            setCurrentProductMediaIndex(
                              existingProductMedia.length + index,
                            );
                            setShowProductMediaModal(true);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              productMedia: prev.productMedia?.filter(
                                (_, i) => i !== index,
                              ),
                            }))
                          }
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display existing product media dari database */}
              {isEditMode && existingProductMedia.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Existing Product Media ({existingProductMedia.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {existingProductMedia.map((media, index) => (
                      <div
                        key={media.imagePublicId}
                        className="relative group w-20 h-20 md:w-24 md:h-24 rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <img
                          src={media.imageUrl}
                          alt={`Product media ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => {
                            setCurrentProductMediaIndex(index);
                            setShowProductMediaModal(true);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // Add to delete list
                            setDeleteMediaIds((prev) => [
                              ...prev,
                              media.imagePublicId,
                            ]);
                            // Remove from display
                            setExistingProductMedia((prev) =>
                              prev.filter(
                                (m) => m.imagePublicId !== media.imagePublicId,
                              ),
                            );
                          }}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Media Image Modal */}
              {showProductMediaModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg max-w-2xl w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        Product Media Preview ({currentProductMediaIndex + 1}/
                        {existingProductMedia.length +
                          (formData.productMedia?.length || 0)}
                        )
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowProductMediaModal(false)}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <img
                      src={
                        currentProductMediaIndex < existingProductMedia.length
                          ? existingProductMedia[currentProductMediaIndex]
                              .imageUrl
                          : URL.createObjectURL(
                              formData.productMedia![
                                currentProductMediaIndex -
                                  existingProductMedia.length
                              ],
                            )
                      }
                      alt="Product media preview"
                      className="w-full h-auto object-contain rounded-lg border border-gray-300"
                    />
                    <div className="flex justify-between mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentProductMediaIndex((prev) =>
                            prev > 0
                              ? prev - 1
                              : existingProductMedia.length +
                                (formData.productMedia?.length || 0) -
                                1,
                          )
                        }
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentProductMediaIndex((prev) =>
                            prev <
                            existingProductMedia.length +
                              (formData.productMedia?.length || 0) -
                              1
                              ? prev + 1
                              : 0,
                          )
                        }
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Next
                      </button>
                    </div>
                  </div>
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
          {currentTabIndex > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="w-30 cursor-pointer"
              onClick={handlePrevTab}
            >
              <ChevronsLeft />
              Prev
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-30 cursor-pointer">
              <Link href="/dashboard/products">Cancel</Link>
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
