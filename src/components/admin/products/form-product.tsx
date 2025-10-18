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
import React, { useEffect, useState } from "react";
import { CategoryData } from "@/lib/types/category";
import { getAll } from "@/lib/apiService";
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
import { VariantEditor, VariantRow, VariantType } from "./varian-editor";
import { Button } from "@/components/ui/button";
import { showErrorAlert } from "@/lib/helpers/sweetalert2";

interface ProductFormProps {
  initialData?: any;
  productId?: string;
}

export default function FormProduct({
  initialData,
  productId,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    sku: "",
    title: "",
    productMedia: [] as File[],
    description: "",
    retailPrice: { USD: 0, IDR: 0, SGD: 0 },
    resellerPrice: {
      basePrice: { USD: 0, IDR: 0, SGD: 0 },
      tiers: [
        {
          name: "Tier 1",
          minimumQuantity: 10,
          discount: 10,
          unitPrice: { USD: 0, IDR: 0, SGD: 0 },
        },
        {
          name: "Tier 2",
          minimumQuantity: 50,
          discount: 15,
          unitPrice: { USD: 0, IDR: 0, SGD: 0 },
        },
        {
          name: "Tier 3",
          minimumQuantity: 100,
          discount: 20,
          unitPrice: { USD: 0, IDR: 0, SGD: 0 },
        },
      ],
    },
    moq: { scheme: "", quantity: undefined as number | undefined },
    preOrder: { enabled: false, leadTime: "" },
    stock: 0,
    variants: [] as Array<{ type: string; values: string[] }>,
    tags: [] as string[],
    categoryId: "",
    shipping: { scheme: "" },
    marketingLinks: [] as string[],
  });

  const [previewSizeProduct, setPreviewSizeProduct] = useState<string | null>(
    null
  );
  const [showSizeProductModal, setShowSizeProductModal] = useState(false);

  const isEditMode = !!productId;
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>(
    () =>
      formData.variants.map((v) => ({
        id: Math.random().toString(36).slice(2, 9),
        name: v.type,
        values: v.values,
      })) || []
  );

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

  const [newTag, setNewTag] = useState("");

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

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      <form className="space-y-2 md:space-y-4" autoComplete="off">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {tabMenu.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="product-details" className="space-y-4 my-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="sku"
                  className="text-base font-medium text-gray-700"
                >
                  Product ID / SKU *
                </Label>
                <Input
                  id="sku"
                  placeholder="Enter product ID / SKU"
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-base font-medium text-gray-700"
                >
                  Product Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="categoryId"
                  className="text-base font-medium text-gray-700"
                >
                  Category *
                </Label>
                <Select required>
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
                        No parent categories available
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
                    defaultValue={1}
                    min={1}
                    placeholder="Enter MOQ"
                    className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                    required
                    autoFocus
                  />
                  <small>Default MOQ is 1</small>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="categoryId"
                className="text-base font-medium text-gray-700"
              >
                Product Images & Videos
              </Label>
              <div className="relative py-1">
                <input
                  type="file"
                  multiple
                  disabled={formData.productMedia.length === 9}
                  accept="image/*,video/*"
                  className={`absolute inset-0 w-full h-full opacity-0 z-10 ${formData.productMedia.length === 9 ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    // Limit to maximum 9 images
                    const limitedFiles = files.slice(0, 9);
                    setFormData({ ...formData, productMedia: limitedFiles });
                    console.log("Selected files:", limitedFiles);
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
              {formData.productMedia.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.productMedia.map((image, index) => (
                    <Badge key={index} variant="secondary">
                      Media {index + 1}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            productMedia: prev.productMedia.filter(
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
              <div className="space-y-1">
                <Input
                  id="tags"
                  placeholder="Enter tags"
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                  required
                  autoFocus
                />
                <small>
                  Separate multiple tags with commas (e.g., cat, dog).
                </small>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="categoryId"
                className="text-base font-medium text-gray-700"
              >
                Description Product *
              </Label>
              <Textarea
                placeholder="Enter description"
                className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="image"
                className="text-base font-medium text-gray-700"
              >
                Upload Size Product
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

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pre-order"
                  className="data-[state=unchecked]:bg-gray-200"
                  checked={formData.preOrder.enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      preOrder: { ...prev.preOrder, enabled: checked },
                    }))
                  }
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
            {/* <div className="space-y-2">
              <Label
                htmlFor="videos"
                className="text-base font-medium text-gray-700"
              >
                Product Videos
              </Label>
              <div className="relative py-1">
                <input
                  type="file"
                  multiple
                  disabled={formData.video?.length === 3}
                  accept="video/*"
                  className={`absolute inset-0 w-full h-full opacity-0 z-10 ${formData.video?.length === 3 ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    // Limit to maximum 3 videos
                    const limitedFiles = files.slice(0, 3);
                    setFormData({ ...formData, video: limitedFiles });
                    console.log("Selected videos:", limitedFiles);
                  }}
                />
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload videos or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MOV, AVI up to 50MB (Max 3 videos)
                  </p>
                </div>
              </div>
              {formData.video?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.video.map((video, index) => (
                    <Badge key={index} variant="secondary">
                      Video {index + 1}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            video: prev.video.filter((_, i) => i !== index),
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
            </div> */}

            <div className="space-y-2">
              <Label className="text-base font-medium">Tipe Variasi</Label>
              <div className="mt-3">
                <VariantEditor
                  value={variantRows}
                  onChange={setVariantRows}
                  variantTypes={variantTypes}
                  onTypesChange={(next) => {
                    setVariantTypes(next);
                    // sync back to formData.variants so the rest of the app keeps working
                    setFormData((prev) => ({
                      ...prev,
                      variants: next.map((t) => ({
                        type: t.name,
                        values: t.values,
                      })),
                    }));
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4 my-3">
            <div className="space-y-2">
              <Label
                htmlFor="tags"
                className="text-base font-medium text-gray-700"
              >
                Tags
              </Label>
              <div className="space-y-1">
                <Input
                  id="tags"
                  placeholder="Enter tags"
                  className="border-gray-300 focus:border-primary/80 focus:ring-primary/80 py-5"
                  required
                  autoFocus
                />
                <small>
                  Separate multiple tags with commas (e.g., cat, dog).
                </small>
              </div>
            </div>

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
      </form>

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
            <Button type="submit" className="w-36 cursor-pointer">
              <Save />
              Submit
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
