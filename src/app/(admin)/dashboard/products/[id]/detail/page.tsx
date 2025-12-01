"use client";

import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getById } from "@/lib/apiService";
import { ProductData, VariantRow } from "@/lib/types/product";
import { ArrowLeft, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function DetailProduct() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [showModalPrice, setShowModalPrice] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<VariantRow | null>(
    null
  );

  const totalStock =
    product?.productVariantsData?.reduce(
      (acc, el) => acc + (el.stock || 0),
      0
    ) ?? 0;

  const fetchProductById = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getById<ProductData>("/api/admin/products", id);

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
    fetchProductById();
  }, [id]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        {product && (
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={() => router.push(`/dashboard/products`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="mt-20">
          <LoadingPage />
        </div>
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/products" />
      ) : (
        product && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 my-5">
              <div className="lg:col-span-1">
                <div className="bg-muted rounded-lg aspect-square flex items-center justify-center">
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                      {product.productMedia.length > 0 ? (
                        product.productMedia[selectedImage].type === "image" ? (
                          <img
                            src={
                              product.productMedia[selectedImage].imageUrl ||
                              "/placeholder.svg"
                            }
                            alt={`Product Image ${product.productName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={product.productMedia[selectedImage].imageUrl}
                            poster={
                              product.productMedia[selectedImage].imageUrl
                            }
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          >
                            {/* Fallback jika browser tidak mendukung */}
                            Your browser does not support the video tag.
                          </video>
                        )
                      ) : (
                        <div className="text-muted-foreground">No image</div>
                      )}
                    </div>
                    {product.productMedia.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {product.productMedia.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                              selectedImage === index
                                ? "border-primary"
                                : "border-muted"
                            }`}
                          >
                            {image.type === "image" ? (
                              <img
                                src={image.imageUrl || "/placeholder.svg"}
                                alt={`Product Image ${product.productName} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="relative w-full h-full">
                                {/* Elemen Video */}
                                <video
                                  src={image.imageUrl}
                                  poster={image.imageUrl}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <h1 className="text-2xl lg:text-3xl font-playfair font-bold text-gray-900 mb-4">
                    {product.productName}
                  </h1>

                  <table className="text-sm md:text-base">
                    <tbody>
                      <tr>
                        <td className="pr-2 font-medium">Category</td>
                        <td className="px-2">:</td>
                        <td className="py-0.5">
                          {product.categoryDetail.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="pr-2 font-medium">MOQ</td>
                        <td className="px-2">:</td>
                        <td className="py-0.5">{product.moq}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 font-medium">Stock</td>
                        <td className="px-2">:</td>
                        <td className="py-0.5">{totalStock | 0}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 font-medium">Exclude Country</td>
                        <td className="px-2">:</td>
                        <td className="py-0.5">
                          {product.exclusive?.country
                            ? product.exclusive.country.join(", ")
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <td className="pr-2 font-medium">Pre-Order</td>
                        <td className="px-2">:</td>
                        <td className="py-0.5">
                          {product.preOrder?.enabled
                            ? `${product.preOrder.leadTime} weeks`
                            : "No"}
                        </td>
                      </tr>
                      <tr>
                        <td className="pr-2 font-medium">Tags</td>
                        <td className="px-2">:</td>
                        <td className="py-0.5">
                          {product.tags?.length
                            ? product.tags.map((el, index) => {
                                return (
                                  <Badge
                                    variant="outline"
                                    className="ml-1"
                                    key={index}
                                  >
                                    {el.tagName}
                                  </Badge>
                                );
                              })
                            : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="space-y-2 text-sm md:text-base">
                    <p className="font-semibold">Description</p>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: product.productDescription,
                      }}
                    />
                  </div>

                  <div className="space-y-2 text-sm md:text-base">
                    <p className="font-semibold">Marketing Links</p>
                    {product.marketingLinks?.length ? (
                      <ul className="list-disc pl-5">
                        {product.marketingLinks.map((el, index) => {
                          return (
                            <li key={index}>
                              <Link
                                href={el}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-900 cursor-pointer font-medium"
                              >
                                Klik Link
                                <ExternalLink size={18} className="ml-2" />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Variant */}
            <div className="mt-6 space-y-4">
              <h3 className="text-base md:text-lg font-medium">
                Variant Product
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">No</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Variation name</TableHead>
                      <TableHead>SKU Code</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.productVariantsData &&
                    product.productVariantsData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      product.productVariantsData?.map((item, idx) => (
                        <TableRow key={item.codeRow}>
                          <TableCell className="text-center">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium ">
                            {item.image ? (
                              <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center">
                                <img
                                  src={item.image.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              </div>
                            ) : (
                              <>No Image</>
                            )}
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.stock}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              className="cursor-pointer"
                              onClick={() => {
                                setShowModalPrice(true);
                                setSelectedVariant(item);
                              }}
                            >
                              Show Price
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {showModalPrice && selectedVariant && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Product Price</h3>
                    <button
                      type="button"
                      onClick={() => setShowModalPrice(false)}
                      className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <table className="text-sm md:text-base">
                    <tbody>
                      {Object.keys(selectedVariant.price).map((el, index) => {
                        return (
                          <tr key={index}>
                            <td className="pr-2 font-medium">{el}</td>
                            <td className="px-2">:</td>
                            <td className="py-0.5">
                              {selectedVariant.price[el]}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
