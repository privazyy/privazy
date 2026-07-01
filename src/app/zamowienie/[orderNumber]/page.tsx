import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderStatusView } from "@/components/shop/shop-components";
import { getPublicOrderView } from "@/server/shop/checkout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status zamowienia - PRIVAZY",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderNumber } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  const order = await getPublicOrderView(orderNumber, token);
  if (!order) notFound();

  return <OrderStatusView order={order} />;
}
