import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MockPaymentPanel } from "@/components/shop/mock-payment-panel";
import { ShopShell } from "@/components/shop/shop-components";
import { getCommerceFlags } from "@/server/commerce/flags";
import { getPrisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description: "Jawna symulacja płatności mock dla checkoutu PRIVAZY.",
  robots: { follow: false, index: false },
  title: "Płatność mock / sandbox - PRIVAZY",
};

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; token?: string }>;
}) {
  const flags = getCommerceFlags();
  const { paymentId, token } = await searchParams;

  if (!flags.checkoutEnabled || !paymentId || !token) notFound();

  const payment = await getPrisma().payment.findUnique({
    include: { order: true },
    where: { id: paymentId },
  });

  if (
    !payment ||
    payment.order.publicAccessToken !== token ||
    payment.provider !== "MOCK" ||
    payment.mode !== "MOCK"
  ) {
    notFound();
  }

  return (
    <ShopShell>
      <div className="px-[var(--gutter)] py-12 min-[721px]:py-16">
        <MockPaymentPanel
          amountGrossCents={payment.amountGrossCents}
          currency={payment.currency}
          orderNumber={payment.order.orderNumber}
          paymentId={payment.id}
          token={token}
        />
      </div>
    </ShopShell>
  );
}
