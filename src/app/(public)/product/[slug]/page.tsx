"use client";
import React, { useEffect, useState } from "react";
import ErrorPublicPage from "@/components/error-public-page";
import LoadingPage from "@/components/loading";
import PricingDisplay from "@/components/product/product-pricing";
import ProductTabs from "@/components/product/product-tabs";
import RelatedProduct from "@/components/product/related-product";
import VariantSelector from "@/components/product/variant-selector";
import { ProductGallery } from "@/components/product/product-galery";
import { Separator } from "@/components/ui/separator";
import { getById } from "@/lib/apiService";
import { ProductData, VariantRow } from "@/lib/types/product";
import { Download, ShoppingCart } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { enrichProduct } from "@/lib/helpers/product";
import { useCurrency } from "@/context/CurrencyContext";
import { useSession } from "next-auth/react";
import { showErrorAlert, showSuccessAlert } from "@/lib/helpers/sweetalert2";
import * as XLSX from "xlsx";
import { filterProductsByCountry } from "@/lib/helpers/product-filter";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const router = useRouter();

  const { currency, userCountry, format } = useCurrency();
  const { data: session } = useSession();

  const [selectedVariant, setSelectedVariant] = useState<{
    selectedVariantTypes: Record<string, string>;
    selectedVariantDetail: VariantRow;
  }>();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(product?.moq || 1);
  const [disabledAddToCart, setDisabledAddToCart] = useState(true);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<ProductData>("/api/public/products", slug);

      if (response.data) {
        setProduct(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    let isDisabled = true;

    if (selectedVariant && product) {
      const selectedTypeCount = Object.keys(
        selectedVariant.selectedVariantTypes
      ).length;
      const selectedVariantCount = Object.keys(
        selectedVariant.selectedVariantDetail.attrs
      ).length;

      isDisabled = selectedTypeCount !== selectedVariantCount;

      if (
        !product.preOrder.enabled &&
        quantity > selectedVariant.selectedVariantDetail.stock
      ) {
        // if product no PO and quantity > stock
        isDisabled = true;
      }

      // if (quantity < product.moq) {
      //   isDisabled = true;
      // }
    }

    setDisabledAddToCart(isDisabled);
  }, [selectedVariant, quantity]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPublicPage errorMessage={error} />;
  }

  if (!product) {
    return <ErrorPublicPage errorMessage="Page Not Found" />;
  }

  const handleAddToCart = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/product/${slug}`);
      showErrorAlert(undefined, "Please login first");
      return;
    }

    let cartItem = JSON.parse(localStorage.getItem("cartItem") || "[]");

    if (selectedVariant) {
      const { selectedVariantDetail } = selectedVariant;

      const existingVariantIndex = cartItem.findIndex(
        (el: any) => el.variantId === selectedVariantDetail._id
      );

      if (existingVariantIndex !== -1) {
        cartItem[existingVariantIndex].quantity += quantity;
      } else {
        cartItem = [
          {
            variantId: selectedVariantDetail._id,
            productId: product._id,
            quantity,
          },
          ...cartItem,
        ];
      }

      localStorage.setItem("cartItem", JSON.stringify(cartItem));

      // Trigger event to update cart badge in header
      window.dispatchEvent(new Event("cartUpdated"));

      setQuantity(1);

      showSuccessAlert(undefined, "Successfully added product to cart");
    }
  };

  const handleDownloadBulkTemplate = async () => {
    try {
      // Fetch all products
      const response = await fetch("/api/public/products");
      const { data: allProducts } = await response.json();

      if (!allProducts || allProducts.length === 0) {
        showErrorAlert(undefined, "No products available");
        return;
      }

      // Filter products by user country
      const filteredProducts = filterProductsByCountry(
        allProducts,
        userCountry
      );

      if (filteredProducts.length === 0) {
        showErrorAlert(undefined, "No products available for your country");
        return;
      }

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([]);

      // Add headers
      const headers = [
        "Product Link",
        "Product Name",
        "Product Category",
        "Variant",
        "SKU",
        `Price ${currency} (before discount)`,
        "Qty",
      ];
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

      let currentRow = 2; // Start from row 2 (after header)

      filteredProducts.forEach((prod: ProductData) => {
        const productLink = `${window.location.origin}/product/${prod.slug}`;
        const productName = prod.productName;
        const productCategory = prod.categoryDetail?.name || "";

        // Enrich product to get pricing
        const enrichedProd = enrichProduct(prod, currency);

        const variants = prod.productVariantsData || [];
        const variantCount = variants.length;

        variants.forEach((variant, index) => {
          const variantAttrs = Object.entries(variant.attrs || {})
            .map(([key, value]) => value)
            .join(" / ");

          const sku = variant.sku || "";

          // Get price before discount
          let priceBeforeDiscount = variant.price[currency] || 0;

          const formattedPrice = format(priceBeforeDiscount);

          // Add row data
          const rowData = [
            index === 0 ? productLink : "", // Product Link only on first row
            index === 0 ? productName : "", // Product Name only on first row
            index === 0 ? productCategory : "", // Category only on first row
            variantAttrs || "-",
            sku,
            formattedPrice,
            0,
          ];

          XLSX.utils.sheet_add_aoa(worksheet, [rowData], {
            origin: `A${currentRow}`,
          });

          // Add hyperlink to Product Link cell (only on first variant row)
          if (index === 0) {
            const cellAddress = `A${currentRow}`;
            if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
            worksheet[cellAddress].l = { Target: productLink };
            worksheet[cellAddress].v = productLink;
          }

          currentRow++;
        });

        // Merge cells for Product Link, Name, and Category if multiple variants
        if (variantCount > 1) {
          const startRow = currentRow - variantCount;
          const endRow = currentRow - 1;

          // Merge Product Link column (A)
          if (!worksheet["!merges"]) worksheet["!merges"] = [];
          worksheet["!merges"].push({
            s: { r: startRow - 1, c: 0 }, // start row, column A
            e: { r: endRow - 1, c: 0 }, // end row, column A
          });

          // Merge Product Name column (B)
          worksheet["!merges"].push({
            s: { r: startRow - 1, c: 1 },
            e: { r: endRow - 1, c: 1 },
          });

          // Merge Product Category column (C)
          worksheet["!merges"].push({
            s: { r: startRow - 1, c: 2 },
            e: { r: endRow - 1, c: 2 },
          });

          // Set vertical alignment to center for merged cells
          const cellAddressA = `A${startRow}`;
          const cellAddressB = `B${startRow}`;
          const cellAddressC = `C${startRow}`;

          if (!worksheet[cellAddressA].s) worksheet[cellAddressA].s = {};
          if (!worksheet[cellAddressB].s) worksheet[cellAddressB].s = {};
          if (!worksheet[cellAddressC].s) worksheet[cellAddressC].s = {};

          worksheet[cellAddressA].s.alignment = { vertical: "center" };
          worksheet[cellAddressB].s.alignment = { vertical: "center" };
          worksheet[cellAddressC].s.alignment = { vertical: "center" };
        }
      });

      XLSX.utils.book_append_sheet(workbook, worksheet, "Bulk Order");

      // Set column widths
      const columnWidths = [
        { wch: 50 }, // Product Link
        { wch: 30 }, // Product Name
        { wch: 20 }, // Product Category
        { wch: 20 }, // Variant
        { wch: 15 }, // SKU
        { wch: 25 }, // Price
        { wch: 10 }, // Qty
      ];
      worksheet["!cols"] = columnWidths;

      // Generate and download file
      const fileName = `Bulk_Order_Template_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      showSuccessAlert(undefined, "Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      showErrorAlert(undefined, "Failed to download template");
    }
  };

  const renderCTAButtons = () => {
    return (
      <div className="space-y-3">
        {session?.user.role === "reseller" ? (
          <button
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              disabledAddToCart
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary/90 hover:bg-primary text-white cursor-pointer"
            }`}
            onClick={handleAddToCart}
            disabled={disabledAddToCart}
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Add to Cart */}
            <button
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                disabledAddToCart
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary/90 hover:bg-primary text-white cursor-pointer"
              }`}
              onClick={handleAddToCart}
              disabled={disabledAddToCart}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>

            {/* Buy Now */}
            <button
              className="w-full border-1 border-primary cursor-pointer bg-white hover:bg-secondary text-primary py-3 px-6 rounded-lg font-semibold transition-colors"
              onClick={() => console.log("Buy now")}
            >
              Buy Now
            </button>
          </div>
        )}

        <Separator className="mb-5 mt-5" />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            Need to place a bulk order?
          </h3>
          <p className="text-blue-800 text-sm mb-3">
            For orders over 100 pieces or custom requirements, download our bulk
            order template and get personalized pricing from your account
            manager.
          </p>
          <button
            onClick={handleDownloadBulkTemplate}
            className="flex font-semibold items-center gap-2 text-blue-800 hover:text-blue-900  text-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Bulk Order Template
          </button>
        </div>
      </div>
    );
  };

  const enrichProductData = enrichProduct(product, currency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {/* Product Gallery */}
            <ProductGallery
              product={{
                productName: product.productName,
                slug: product.slug,
                tags: product.tags || [],
                createdAt: product.createdAt,
              }}
              productMedia={[
                ...[
                  ...(product.productMedia || []),
                  ...(enrichProductData.variantImages || []),
                ].filter(
                  (
                    img
                  ): img is {
                    imageUrl: string;
                    imagePublicId: string;
                    type: string;
                  } => !!img.imageUrl && !!img.imagePublicId && !!img.type
                ),
              ]}
              selectedVariant={selectedVariant}
            />

            <div className="hidden lg:block">
              <ProductTabs product={product} />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product?.productName}
                </h1>
              </div>

              {/* category */}
              {product.categoryDetail.name.toLowerCase() === "essential" ||
              product.categoryDetail.name.toLowerCase() === "basic" ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {product.categoryDetail.name}
                </span>
              ) : (
                <span
                  className={`bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium`}
                >
                  {product.categoryDetail.name}
                </span>
              )}
            </div>

            {/* Pricing Display */}
            {selectedVariant && (
              <PricingDisplay
                selectedVariant={selectedVariant}
                moq={product.moq}
                productId={product._id}
                resellerPricing={product.resellerPricing}
              />
            )}

            {/* Variant Selector */}
            <VariantSelector
              productVariant={product.productVariantsData || []}
              quantity={quantity || 1}
              setQuantity={setQuantity}
              moq={product.moq || 1}
              attributes={enrichProductData.attributes}
              setSelectedVariant={setSelectedVariant}
              preOrder={product.preOrder}
            />

            {/* CTA Buttons */}
            {renderCTAButtons()}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="lg:hidden">
          <ProductTabs product={product} />
        </div>

        <RelatedProduct selectedProduct={product} />
      </div>
    </div>
  );
}
