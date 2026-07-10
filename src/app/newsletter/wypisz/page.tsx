import type { Metadata } from "next";

import { UnsubscribeForm } from "@/components/newsletter/unsubscribe-form";

export const metadata: Metadata = {
  title: "Wypis z newslettera - PRIVAZY",
  description: "Publiczny formularz wypisu z newslettera PRIVAZY.",
  robots: { index: false, follow: false },
};

type NewsletterUnsubscribePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function NewsletterUnsubscribePage({ searchParams }: NewsletterUnsubscribePageProps) {
  const { token } = await searchParams;

  return (
    <main className="min-h-screen bg-[var(--surface-page)] py-12">
      <section className="mx-auto grid w-full max-w-xl gap-5 px-[var(--gutter)]">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Wypis z newslettera</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">
            Link wypisu nie wymaga logowania. Token jest porownywany po hashu i nie jest zapisywany w bazie w postaci jawnej.
          </p>
        </div>
        <UnsubscribeForm initialToken={token ?? ""} />
      </section>
    </main>
  );
}
