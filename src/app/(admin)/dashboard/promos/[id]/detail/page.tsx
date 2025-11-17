import DetailPromo from "@/components/admin/promos/detail/detail-promo";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PromoDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <DetailPromo promoId={id} />;
}
