"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Package, Tag, Edit, Info } from "lucide-react";
import { PromoData } from "@/lib/types/promo";
import { getById } from "@/lib/apiService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ErrorPage from "@/components/admin/error-page";
import LoadingPage from "@/components/admin/loading-page";
import ShowVariantDiscountItem from "./show-variant-discount-item";

interface DetailPromoProps {
  promoId: string;
}

const CURRENCIES = ["IDR", "SGD", "HKD", "USD"];

export default function DetailPromo({ promoId }: DetailPromoProps) {
  const router = useRouter();
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromoDetail();
  }, [promoId]);

  const fetchPromoDetail = async () => {
    try {
      const response = await getById<PromoData>("/api/admin/promos", promoId);
      if (response.data) {
        setPromo(response.data);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching promo:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPromoStatus = (promo: PromoData) => {
    if (!promo.isActive) {
      return { label: "Inactive", variant: "secondary" as const };
    }

    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (now < startDate) {
      return { label: "Upcoming", variant: "default" as const };
    } else if (now > endDate) {
      return { label: "Expired", variant: "destructive" as const };
    } else {
      return { label: "Active", variant: "default" as const };
    }
  };

  const activeVariantsCount = promo?.products.reduce(
    (count, product) =>
      count + product.variants.filter((v) => v.isActive).length,
    0
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={() => router.push(`/dashboard/promos`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Promotions
        </Button>

        {promo && (
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={() => router.push(`/dashboard/promos/${promo._id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Promotion
          </Button>
        )}
      </div>

      {loading ? (
        <div className="mt-20">
          <LoadingPage />
        </div>
      ) : error ? (
        <ErrorPage errorMessage={error} url="/dashboard/promos" />
      ) : (
        promo && (
          <div className="my-4">
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-playfair font-bold text-foreground">
                {promo.promoName}
              </h1>
              <table className="text-sm md:text-base">
                <tbody>
                  <tr>
                    <td className="flex items-center gap-2 ml">
                      <Calendar className="h-4 w-4" />
                      Periode
                    </td>
                    <td className="px-2">:</td>
                    <td className="py-0.5">
                      {formatDate(promo.startDate)} -{" "}
                      {formatDate(promo.endDate)}
                    </td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2 ml">
                      <Info className="h-4 w-4" />
                      Status
                    </td>
                    <td className="px-2">:</td>
                    <td className="py-0.5">
                      <Badge variant={getPromoStatus(promo).variant}>
                        {getPromoStatus(promo).label}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2 ml">
                      <Package className="h-4 w-4" />
                      Product (s)
                    </td>
                    <td className="px-2">:</td>
                    <td className="py-0.5">
                      {promo.products.length} Products{" "}
                      <span className="text-xs md:text-sm">
                        ({activeVariantsCount} Active Variants)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5" />
                Products in Promotion
              </h2>
            </div>

            {promo.products.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">There are no products yet.</p>
              </div>
            ) : (
              <div className="space-y-4 border rounded-lg p-6 overflow-x-auto">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  defaultValue={promo.products[0].productId}
                >
                  {promo.products.map((product) => (
                    <AccordionItem
                      value={product.productId}
                      key={product.productId}
                    >
                      <AccordionTrigger className="flex items-center justify-between pb-3 no-underline hover:no-underline cursor-pointer">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image?.imageUrl || "/placeholder.png"}
                            alt={product.productName}
                            className="w-20 h-20 object-cover rounded border"
                          />

                          <div>
                            <h3 className="font-semibold text-base">
                              {product.productName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {product.variants.length} variants (
                              {
                                product.variants.filter((el) => el.isActive)
                                  .length
                              }{" "}
                              Active variants)
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 overflow-x-auto">
                        {product.variants.map((variant) => (
                          <ShowVariantDiscountItem
                            key={variant.variantId}
                            variant={variant}
                            currencies={CURRENCIES}
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
