import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPrisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NewsletterUnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const prisma = getPrisma();
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  });

  if (subscriber && subscriber.status !== "UNSUBSCRIBED") {
    await prisma.newsletterSubscriber.update({
      data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
      where: { id: subscriber.id },
    });
    await prisma.newsletterEvent.create({
      data: { metadata: {}, subscriberId: subscriber.id, type: "UNSUBSCRIBED" },
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface-page)] px-[var(--gutter)] py-12 text-[var(--text-strong)]">
      <Card className="w-full max-w-[520px] text-center" padding="lg">
        <h1 className="text-2xl font-bold">{subscriber ? "Wypisano z newslettera" : "Nie znaleziono subskrypcji"}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          {subscriber ? "Adres zostal oznaczony jako wypisany. Nie uruchamiamy kampanii masowych w tej fazie." : "Token wypisu jest nieprawidlowy albo subskrypcja zostala juz usunieta."}
        </p>
        <Button asChild className="mt-6"><Link href="/blog">Wroc do bloga</Link></Button>
      </Card>
    </main>
  );
}
