"use client";
import DetailPromo from "@/components/admin/promos/detail/detail-promo";
import { useParams } from "next/navigation";

export default function PromoDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return <DetailPromo promoId={id} />;
}
